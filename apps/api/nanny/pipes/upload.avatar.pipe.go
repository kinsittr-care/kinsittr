package pipes

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

const (
	maxAvatarBytes = 5 * 1024 * 1024 // 5 MB
	avatarFolder   = "nanny-avatars"
)

func (p *NannyPipe) UploadAvatar(ctx context.Context, userID uuid.UUID, data []byte) *shared.PipeRes[OwnNannyProfile] {
	if p.cloudinary == nil || !p.cloudinary.Configured() {
		log.Printf("nanny_avatar_upload_failed user_id=%s result=cloudinary_not_configured", userID)
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Cloudinary_Not_Configured),
		}
	}

	if len(data) == 0 {
		log.Printf("nanny_avatar_upload_failed user_id=%s result=empty_file", userID)
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Invalid_File),
		}
	}
	if len(data) > maxAvatarBytes {
		log.Printf("nanny_avatar_upload_failed user_id=%s result=file_too_large bytes=%d", userID, len(data))
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Too_Large),
		}
	}

	ct := detectAvatarContentType(data)
	switch ct {
	case "image/jpeg", "image/png", "image/webp":
	default:
		log.Printf("nanny_avatar_upload_failed user_id=%s result=invalid_type content_type=%s", userID, ct)
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Invalid_Type),
		}
	}

	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		log.Printf("nanny_avatar_upload_failed user_id=%s result=profile_not_found err=%v", userID, err)
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	publicID := profile.ID.String()
	result, err := p.cloudinary.UploadImage(ctx, data, avatarFolder, publicID)
	if err != nil {
		log.Printf("nanny_avatar_upload_failed user_id=%s profile_id=%s result=provider_failed", userID, profile.ID)
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Upload_Failed),
		}
	}

	updated, err := p.profileRepo.UpdateNannyAvatar(ctx, userID, result.SecureURL, result.PublicID)
	if err != nil || updated.ID == uuid.Nil {
		log.Printf("nanny_avatar_upload_failed user_id=%s profile_id=%s result=record_failed err=%v", userID, profile.ID, err)
		return &shared.PipeRes[OwnNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Upload_Failed),
		}
	}

	if shouldDeletePreviousAvatar(profile.AvatarPublicID, result.PublicID) {
		if err := p.cloudinary.DeleteImage(ctx, profile.AvatarPublicID); err != nil {
			log.Printf("cloudinary.delete_previous_avatar_failed profile_id=%s public_id=%s err=%v", profile.ID, profile.AvatarPublicID, err)
		}
	}

	log.Printf("nanny_avatar_upload_success user_id=%s profile_id=%s public_id=%s", userID, updated.ID, result.PublicID)
	response := ownNannyProfileData(updated)
	return &shared.PipeRes[OwnNannyProfile]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Avatar_Uploaded),
		Data:    &response,
	}
}

func detectAvatarContentType(data []byte) string {
	if len(data) == 0 {
		return ""
	}
	sniffLen := min(len(data), 512)
	return strings.ToLower(strings.SplitN(http.DetectContentType(data[:sniffLen]), ";", 2)[0])
}

func shouldDeletePreviousAvatar(previousPublicID string, nextPublicID string) bool {
	previousPublicID = strings.TrimSpace(previousPublicID)
	nextPublicID = strings.TrimSpace(nextPublicID)
	return previousPublicID != "" && previousPublicID != nextPublicID
}
