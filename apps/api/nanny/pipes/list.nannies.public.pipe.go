package pipes

import (
	"context"
	"strings"

	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/dtos"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	repository "github.com/kinsittr/kinsittr-api/repositories/nanny"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) ListPublic(ctx context.Context, query dtos.ListPublicNanniesQuery) *shared.PipeRes[PublicNannyListData] {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Limit < 1 {
		query.Limit = 12
	}
	if query.Limit > 50 {
		query.Limit = 50
	}
	query.City = strings.TrimSpace(query.City)
	query.Province = strings.TrimSpace(query.Province)
	query.Sort = strings.ToLower(strings.TrimSpace(query.Sort))
	query.ServiceType = strings.ToLower(strings.TrimSpace(query.ServiceType))

	if query.MinRate < 0 || query.MaxRate < 0 {
		return &shared.PipeRes[PublicNannyListData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Public_Query),
		}
	}
	if query.MinRate > 0 && query.MaxRate > 0 && query.MinRate > query.MaxRate {
		return &shared.PipeRes[PublicNannyListData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Public_Query),
		}
	}
	if query.ServiceType != "" && query.ServiceType != string(models.NannyServiceType) {
		return &shared.PipeRes[PublicNannyListData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Public_Query),
		}
	}
	switch query.Sort {
	case "", "newest", "oldest", "rate_asc", "rate_desc", "rating_desc":
	default:
		return &shared.PipeRes[PublicNannyListData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Public_Query),
		}
	}

	nannies, total, err := p.repo.ListVerifiedNannies(ctx, repository.ListVerifiedNanniesFilter{
		Page:        query.Page,
		Limit:       query.Limit,
		City:        query.City,
		Province:    query.Province,
		MinRate:     query.MinRate,
		MaxRate:     query.MaxRate,
		ServiceType: models.ServiceType(query.ServiceType),
		Sort:        query.Sort,
	})
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
			Page:  query.Page,
			Limit: query.Limit,
			Total: total,
		},
	}
}
