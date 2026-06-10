package pipes

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/parent/dtos"
	"github.com/kinsittr/kinsittr-api/parent/messages"
)

type mockProfileRepo struct {
	parentProfile     models.ParentProfile
	parentProfileErr  error
	updatedParent     models.ParentProfile
	updateParentErr   error
	settings          models.ParentSettings
	settingsErr       error
	updatedSettings   models.ParentSettings
	updateSettingsErr error
	lastParentUpdate  models.ParentProfile
}

func (m *mockProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return m.parentProfile, m.parentProfileErr
}
func (m *mockProfileRepo) UpdateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) UpdateNannyAvatar(_ context.Context, _ uuid.UUID, _ string, _ string) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	m.lastParentUpdate = p
	return m.updatedParent, m.updateParentErr
}
func (m *mockProfileRepo) GetOrCreateParentSettings(_ context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	if m.settings.ID == uuid.Nil && m.settingsErr == nil {
		m.settings = models.ParentSettings{ID: uuid.New(), UserID: userID}
	}
	return m.settings, m.settingsErr
}
func (m *mockProfileRepo) UpdateParentSettings(_ context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	if m.updatedSettings.ID == uuid.Nil && m.updateSettingsErr == nil {
		settings.ID = uuid.New()
		m.updatedSettings = settings
	}
	return m.updatedSettings, m.updateSettingsErr
}
func (m *mockProfileRepo) DeleteNannyProfile(_ context.Context, _ uuid.UUID) error  { return nil }
func (m *mockProfileRepo) DeleteParentProfile(_ context.Context, _ uuid.UUID) error { return nil }

func TestGetOwnProfile(t *testing.T) {
	userID := uuid.New()

	t.Run("not found", func(t *testing.T) {
		res := NewParentPipe(&mockProfileRepo{}).GetOwnProfile(context.Background(), userID)
		if res.Success || string(res.Message) != messages.Parent_Profile_Not_Found {
			t.Fatalf("expected %s, got success=%v msg=%s", messages.Parent_Profile_Not_Found, res.Success, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		profile := models.ParentProfile{ID: uuid.New(), DisplayName: "Alex"}
		res := NewParentPipe(&mockProfileRepo{parentProfile: profile}).GetOwnProfile(context.Background(), userID)
		if !res.Success || string(res.Message) != messages.Parent_Profile_Fetched || res.Data.DisplayName != "Alex" {
			t.Fatalf("unexpected response: success=%v msg=%s data=%+v", res.Success, res.Message, res.Data)
		}
	})
}

func TestUpdateOwnProfile(t *testing.T) {
	userID := uuid.New()
	dto := dtos.UpdateParentProfileDTO{
		DisplayName: " Alex Parent ", NumChildren: 2, ChildrenAges: []int{4, 7},
		Phone: " +14165550100 ", City: " Toronto ", Province: " ON ",
	}

	t.Run("repo error", func(t *testing.T) {
		res := NewParentPipe(&mockProfileRepo{updateParentErr: errors.New("db")}).UpdateOwnProfile(context.Background(), userID, dto)
		if res.Success || string(res.Message) != messages.Parent_Profile_Not_Found {
			t.Fatalf("expected %s, got %s", messages.Parent_Profile_Not_Found, res.Message)
		}
	})

	t.Run("success trims string fields", func(t *testing.T) {
		updated := models.ParentProfile{ID: uuid.New(), DisplayName: "Alex Parent", City: "Toronto", Province: "ON"}
		repo := &mockProfileRepo{updatedParent: updated}
		res := NewParentPipe(repo).UpdateOwnProfile(context.Background(), userID, dto)
		if !res.Success || string(res.Message) != messages.Parent_Profile_Updated || res.Data.DisplayName != "Alex Parent" {
			t.Fatalf("unexpected response: success=%v msg=%s data=%+v", res.Success, res.Message, res.Data)
		}
		if repo.lastParentUpdate.Phone != "+14165550100" {
			t.Fatalf("expected normalized phone, got %q", repo.lastParentUpdate.Phone)
		}
		if repo.lastParentUpdate.City != "toronto" || repo.lastParentUpdate.Province != "on" {
			t.Fatalf("expected lowercase location, got city=%q province=%q", repo.lastParentUpdate.City, repo.lastParentUpdate.Province)
		}
	})
}

func TestParentSettings(t *testing.T) {
	userID := uuid.New()

	t.Run("get settings success", func(t *testing.T) {
		settings := models.ParentSettings{ID: uuid.New(), UserID: userID}
		res := NewParentPipe(&mockProfileRepo{settings: settings}).GetOwnSettings(context.Background(), userID)
		if !res.Success || string(res.Message) != messages.Parent_Settings_Fetched {
			t.Fatalf("unexpected response: success=%v msg=%s", res.Success, res.Message)
		}
	})

	t.Run("update requires parent profile", func(t *testing.T) {
		res := NewParentPipe(&mockProfileRepo{}).UpdateOwnSettings(context.Background(), userID, dtos.UpdateParentSettingsDTO{})
		if res.Success || string(res.Message) != messages.Parent_Profile_Not_Found {
			t.Fatalf("expected %s, got %s", messages.Parent_Profile_Not_Found, res.Message)
		}
	})

	t.Run("update success", func(t *testing.T) {
		repo := &mockProfileRepo{parentProfile: models.ParentProfile{ID: uuid.New()}}
		dto := dtos.UpdateParentSettingsDTO{Language: " en ", Currency: " CAD ", Timezone: " America/Toronto "}
		res := NewParentPipe(repo).UpdateOwnSettings(context.Background(), userID, dto)
		if !res.Success || string(res.Message) != messages.Parent_Settings_Updated || res.Data.Language != "en" {
			t.Fatalf("unexpected response: success=%v msg=%s data=%+v", res.Success, res.Message, res.Data)
		}
	})
}
