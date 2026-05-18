package admin

import (
	"context"
	"fmt"
)

func buildAnalyticsBookingsWhere(filter AnalyticsRangeFilter) (string, []any) {
	where := "1 = 1"
	args := []any{}
	if filter.DateFrom != nil {
		args = append(args, *filter.DateFrom)
		where += fmt.Sprintf(" AND b.date >= $%d", len(args))
	}
	if filter.DateTo != nil {
		args = append(args, *filter.DateTo)
		where += fmt.Sprintf(" AND b.date <= $%d", len(args))
	}
	return where, args
}

func buildAnalyticsUsersWhere(filter AnalyticsRangeFilter) (string, []any) {
	where := "1 = 1"
	args := []any{}
	if filter.DateFrom != nil {
		args = append(args, *filter.DateFrom)
		where += fmt.Sprintf(" AND u.created_at >= $%d", len(args))
	}
	if filter.DateTo != nil {
		args = append(args, *filter.DateTo)
		where += fmt.Sprintf(" AND u.created_at <= $%d", len(args))
	}
	return where, args
}

func (r *pgRepository) GetAnalyticsSummary(ctx context.Context, filter AnalyticsRangeFilter) (AnalyticsSummary, error) {
	if filter.CityLimit < 1 {
		filter.CityLimit = 10
	}
	if filter.TopNanniesLimit < 1 {
		filter.TopNanniesLimit = 10
	}

	where, args := buildAnalyticsBookingsWhere(filter)
	var summary AnalyticsSummary
	err := r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT
			COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0),
			COUNT(*) FILTER (WHERE b.status IN ('pending', 'approved')),
			COUNT(*) FILTER (
				WHERE b.date >= date_trunc('week', CURRENT_DATE)::date
				  AND b.date < (date_trunc('week', CURRENT_DATE)::date + INTERVAL '7 days')
			),
			COALESCE(AVG(NULLIF(b.total_amount, 0)), 0)
		FROM bookings b
		WHERE %s
	`, where), args...).Scan(
		&summary.TotalRevenue,
		&summary.ActiveBookings,
		&summary.BookingsThisWeek,
		&summary.AverageBookingValue,
	)
	if err != nil {
		return AnalyticsSummary{}, err
	}

	if err := r.db.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE verification_status = 'verified'),
			COUNT(*) FILTER (WHERE verification_status IN ('pending', 'under_review'))
		FROM nanny_profiles
	`).Scan(&summary.VerifiedNannies, &summary.PendingNannies); err != nil {
		return AnalyticsSummary{}, err
	}

	cityRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT COALESCE(NULLIF(pp.city, ''), 'Unknown') AS city, COUNT(*)::int AS count
		FROM bookings b
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		WHERE %s
		GROUP BY city
		ORDER BY count DESC, city ASC
		LIMIT $%d
	`, where, len(args)+1), append(append([]any{}, args...), filter.CityLimit)...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer cityRows.Close()
	for cityRows.Next() {
		var metric CityBookingMetric
		if err := cityRows.Scan(&metric.City, &metric.Count); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.BookingsByCity = append(summary.BookingsByCity, metric)
	}
	if err := cityRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	bucket := filter.Bucket
	timeRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT date_trunc('%s', b.date::timestamp)::date AS period,
		       COUNT(*)::int AS bookings_count,
		       COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) AS revenue
		FROM bookings b
		WHERE %s
		GROUP BY period
		ORDER BY period ASC
	`, bucket, where), args...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer timeRows.Close()
	for timeRows.Next() {
		var metric AnalyticsTimeSeriesMetric
		if err := timeRows.Scan(&metric.Period, &metric.BookingsCount, &metric.Revenue); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.TimeSeries = append(summary.TimeSeries, metric)
	}
	if err := timeRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	topArgs := append(append([]any{}, args...), filter.TopNanniesLimit)
	topRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT np.id::text, np.display_name, np.city, np.province,
		       COUNT(*) FILTER (WHERE b.status = 'completed')::int AS completed_count,
		       COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) AS revenue,
		       np.rating_avg
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		WHERE %s
		GROUP BY np.id, np.display_name, np.city, np.province, np.rating_avg
		HAVING COUNT(*) FILTER (WHERE b.status = 'completed') > 0
		ORDER BY revenue DESC, completed_count DESC, np.display_name ASC
		LIMIT $%d
	`, where, len(topArgs)), topArgs...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer topRows.Close()
	for topRows.Next() {
		var metric TopNannyMetric
		if err := topRows.Scan(
			&metric.NannyProfileID,
			&metric.DisplayName,
			&metric.City,
			&metric.Province,
			&metric.CompletedCount,
			&metric.Revenue,
			&metric.RatingAvg,
		); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.TopNannies = append(summary.TopNannies, metric)
	}
	if err := topRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	userWhere, userArgs := buildAnalyticsUsersWhere(filter)
	regRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT date_trunc('%s', u.created_at)::date AS period,
		       COUNT(*) FILTER (WHERE u.role = 'parent')::int AS parent_count,
		       COUNT(*) FILTER (WHERE u.role = 'nanny')::int AS nanny_count
		FROM users u
		WHERE %s AND u.role IN ('parent', 'nanny')
		GROUP BY period
		ORDER BY period ASC
	`, bucket, userWhere), userArgs...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer regRows.Close()
	for regRows.Next() {
		var metric RegistrationTrendMetric
		if err := regRows.Scan(&metric.Period, &metric.ParentCount, &metric.NannyCount); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.RegistrationTrends = append(summary.RegistrationTrends, metric)
	}
	if err := regRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	return summary, nil
}
