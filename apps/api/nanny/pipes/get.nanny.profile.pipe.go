package pipes

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) GetOwnProfile(ctx context.Context, userID uuid.UUID) *shared.PipeRes[OwnNannyProfile] {
	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	data := ownNannyProfileData(profile)
	return &shared.PipeRes[OwnNannyProfile]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Nanny_Profile_Fetched),
		Data:    &data,
	}
}

func ownNannyProfileData(profile models.NannyProfile) OwnNannyProfile {
	return OwnNannyProfile{
		ID:                 profile.ID.String(),
		PublicSlug:         publicSlugForProfile(profile),
		DisplayName:        profile.DisplayName,
		Phone:              profile.Phone,
		Bio:                profile.Bio,
		Specialties:        slices.Clone(profile.Specialties),
		RatePerHour:        profile.RatePerHour,
		ServiceType:        profile.ServiceType,
		Currency:           profile.Currency,
		VerificationStatus: profile.VerificationStatus,
		VerifiedAt:         formatOptionalProfileTime(profile.VerifiedAt),
		StripeOnboarded:    profile.StripeOnboarded,
		RatingAvg:          profile.RatingAvg,
		RatingCount:        profile.RatingCount,
		AvatarURL:          profile.AvatarURL,
		City:               profile.City,
		Province:           profile.Province,
	}
}

var slugUnsafeChars = regexp.MustCompile(`[^a-z0-9]+`)

func publicSlugForProfile(profile models.NannyProfile) string {
	name := strings.Trim(slugUnsafeChars.ReplaceAllString(strings.ToLower(strings.TrimSpace(profile.DisplayName)), "-"), "-")
	if name == "" {
		name = "nanny"
	}
	sum := md5.Sum([]byte(profile.ID.String()))
	hash := hex.EncodeToString(sum[:])[:8]
	return name + "-" + hash
}

func formatOptionalProfileTime(value *time.Time) string {
	if value == nil || value.IsZero() {
		return ""
	}
	return value.UTC().Format(time.RFC3339)
}
