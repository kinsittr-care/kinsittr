package pipes

import (
	"context"
	"strings"
	"time"

	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func normalizeAnalyticsBucket(value string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "week":
		return "week", true
	case "day":
		return "day", true
	case "month":
		return "month", true
	default:
		return "", false
	}
}

func normalizeAnalyticsLimit(value, fallback, max int) int {
	if value < 1 {
		return fallback
	}
	if value > max {
		return max
	}
	return value
}

func (p *AdminPipe) Analytics(ctx context.Context, dto dtos.AdminAnalyticsQueryDTO) *shared.PipeRes[AdminAnalyticsData] {
	dateFrom, err := parseDate(dto.DateFrom, false)
	if err != nil {
		return pipeError[AdminAnalyticsData](messages.Invalid_Admin_Request)
	}
	dateTo, err := parseDate(dto.DateTo, true)
	if err != nil {
		return pipeError[AdminAnalyticsData](messages.Invalid_Admin_Request)
	}
	if dateFrom != nil && dateTo != nil && dateFrom.After(*dateTo) {
		return pipeError[AdminAnalyticsData](messages.Invalid_Admin_Request)
	}
	bucket, ok := normalizeAnalyticsBucket(dto.Bucket)
	if !ok {
		return pipeError[AdminAnalyticsData](messages.Invalid_Admin_Request)
	}

	summary, err := p.repo.GetAnalyticsSummary(ctx, repository.AnalyticsRangeFilter{
		DateFrom:        dateFrom,
		DateTo:          dateTo,
		Bucket:          bucket,
		CityLimit:       normalizeAnalyticsLimit(dto.CityLimit, 10, 50),
		TopNanniesLimit: normalizeAnalyticsLimit(dto.TopNanniesLimit, 10, 50),
	})
	if err != nil {
		return pipeError[AdminAnalyticsData](messages.Invalid_Admin_Request)
	}
	fillAnalyticsBuckets(&summary, bucket, dateFrom, dateTo)
	data := toAnalyticsData(summary, p.platformFeeRate)
	return pipeSuccess(messages.Admin_Analytics_Fetched, &data)
}

func fillAnalyticsBuckets(summary *repository.AnalyticsSummary, bucket string, dateFrom, dateTo *time.Time) {
	start, end, ok := analyticsBounds(summary, dateFrom, dateTo)
	if !ok {
		return
	}
	start = truncateAnalyticsPeriod(start, bucket)
	end = truncateAnalyticsPeriod(end, bucket)

	timeByPeriod := make(map[time.Time]repository.AnalyticsTimeSeriesMetric, len(summary.TimeSeries))
	for _, item := range summary.TimeSeries {
		timeByPeriod[truncateAnalyticsPeriod(item.Period, bucket)] = item
	}
	regByPeriod := make(map[time.Time]repository.RegistrationTrendMetric, len(summary.RegistrationTrends))
	for _, item := range summary.RegistrationTrends {
		regByPeriod[truncateAnalyticsPeriod(item.Period, bucket)] = item
	}

	filledTime := []repository.AnalyticsTimeSeriesMetric{}
	filledReg := []repository.RegistrationTrendMetric{}
	for current := start; !current.After(end); current = nextAnalyticsPeriod(current, bucket) {
		if item, ok := timeByPeriod[current]; ok {
			filledTime = append(filledTime, item)
		} else {
			filledTime = append(filledTime, repository.AnalyticsTimeSeriesMetric{Period: current})
		}
		if item, ok := regByPeriod[current]; ok {
			filledReg = append(filledReg, item)
		} else {
			filledReg = append(filledReg, repository.RegistrationTrendMetric{Period: current})
		}
	}
	summary.TimeSeries = filledTime
	summary.RegistrationTrends = filledReg
}

func analyticsBounds(summary *repository.AnalyticsSummary, dateFrom, dateTo *time.Time) (time.Time, time.Time, bool) {
	var start time.Time
	var end time.Time
	if dateFrom != nil {
		start = *dateFrom
	}
	if dateTo != nil {
		end = *dateTo
	}
	for _, item := range summary.TimeSeries {
		if start.IsZero() || item.Period.Before(start) {
			start = item.Period
		}
		if end.IsZero() || item.Period.After(end) {
			end = item.Period
		}
	}
	for _, item := range summary.RegistrationTrends {
		if start.IsZero() || item.Period.Before(start) {
			start = item.Period
		}
		if end.IsZero() || item.Period.After(end) {
			end = item.Period
		}
	}
	return start, end, !start.IsZero() && !end.IsZero()
}

func truncateAnalyticsPeriod(value time.Time, bucket string) time.Time {
	value = value.UTC()
	switch bucket {
	case "day":
		return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, time.UTC)
	case "month":
		return time.Date(value.Year(), value.Month(), 1, 0, 0, 0, 0, time.UTC)
	default:
		weekday := int(value.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		monday := value.AddDate(0, 0, -(weekday - 1))
		return time.Date(monday.Year(), monday.Month(), monday.Day(), 0, 0, 0, 0, time.UTC)
	}
}

func nextAnalyticsPeriod(value time.Time, bucket string) time.Time {
	switch bucket {
	case "day":
		return value.AddDate(0, 0, 1)
	case "month":
		return value.AddDate(0, 1, 0)
	default:
		return value.AddDate(0, 0, 7)
	}
}
