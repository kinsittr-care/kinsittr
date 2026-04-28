package pipes

import (
	"context"

	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) ListPublic(ctx context.Context, page, limit int) *shared.PipeRes[PublicNannyListData] {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 12
	}
	if limit > 50 {
		limit = 50
	}

	nannies, total, err := p.repo.ListVerifiedNannies(ctx, page, limit)
	if err != nil {
		return &shared.PipeRes[PublicNannyListData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	items := make([]PublicNannyCard, 0, len(nannies))
	for _, nanny := range nannies {
		items = append(items, PublicNannyCard{
			ID:          nanny.ID.String(),
			DisplayName: nanny.DisplayName,
			Bio:         nanny.Bio,
			RatePerHour: nanny.RatePerHour,
			ServiceType: nanny.ServiceType,
			Currency:    nanny.Currency,
			RatingAvg:   nanny.RatingAvg,
			RatingCount: nanny.RatingCount,
			City:        nanny.City,
			Province:    nanny.Province,
		})
	}
	return &shared.PipeRes[PublicNannyListData]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Nannies_Fetched),
		Data: &PublicNannyListData{
			Items: items,
			Page:  page,
			Limit: limit,
			Total: total,
		},
	}
}
