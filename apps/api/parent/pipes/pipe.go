package pipes

import (
	"strings"

	"github.com/kinsittr/kinsittr-api/repositories/profile"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type ParentPipe struct {
	profileRepo profile.ProfileRepository
}

func NewParentPipe(profileRepo profile.ProfileRepository) *ParentPipe {
	return &ParentPipe{profileRepo: profileRepo}
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: false,
		Message: shared.CreatePipeMessage(message),
	}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: true,
		Message: shared.CreatePipeMessage(message),
		Data:    data,
	}
}

func normalizeString(value string) string {
	return strings.TrimSpace(value)
}
