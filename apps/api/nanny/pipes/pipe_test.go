package pipes

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/dtos"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	nannyrepo "github.com/kinsittr/kinsittr-api/repositories/nanny"
)

// ── mock repos ────────────────────────────────────────────────────────────────

type mockNannyRepo struct {
	nanny        models.NannyProfile
	nannyErr     error
	nannies      []models.NannyProfile
	nanniesTotal int
	nanniesErr   error
}

func (m *mockNannyRepo) GetVerifiedNannyByID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nanny, m.nannyErr
}
func (m *mockNannyRepo) ListVerifiedNannies(_ context.Context, _ nannyrepo.ListVerifiedNanniesFilter) ([]models.NannyProfile, int, error) {
	return m.nannies, m.nanniesTotal, m.nanniesErr
}

type mockProfileRepo struct {
	nannyProfile    models.NannyProfile
	nannyProfileErr error
	updatedNanny    models.NannyProfile
	updateNannyErr  error
}

func (m *mockProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nannyProfile, m.nannyProfileErr
}
func (m *mockProfileRepo) UpdateNannyProfile(_ context.Context, _ models.NannyProfile) (models.NannyProfile, error) {
	return m.updatedNanny, m.updateNannyErr
}
func (m *mockProfileRepo) UpdateNannyAvatar(_ context.Context, _ uuid.UUID, _ string, _ string) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return models.ParentProfile{}, nil
}
func (m *mockProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetOrCreateParentSettings(_ context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	return models.ParentSettings{ID: uuid.New(), UserID: userID}, nil
}
func (m *mockProfileRepo) UpdateParentSettings(_ context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	if settings.ID == uuid.Nil {
		settings.ID = uuid.New()
	}
	return settings, nil
}
func (m *mockProfileRepo) DeleteNannyProfile(_ context.Context, _ uuid.UUID) error  { return nil }
func (m *mockProfileRepo) DeleteParentProfile(_ context.Context, _ uuid.UUID) error { return nil }

// ── normalizeSpecialty ────────────────────────────────────────────────────────

func TestNormalizeSpecialty(t *testing.T) {
	cases := []struct {
		input string
		want  string
	}{
		{"Infant care", "Infant care"},
		{"infant care", "Infant care"}, // case-insensitive
		{"INFANT CARE", "Infant care"},
		{"  Bilingual  ", "Bilingual"}, // whitespace trimmed
		{"CPR certified", "CPR certified"},
		{"unknown specialty", ""}, // not in allowlist → empty
		{"", ""},
	}
	for _, tc := range cases {
		got := normalizeSpecialty(tc.input)
		if got != tc.want {
			t.Errorf("normalizeSpecialty(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestNormalizeSpecialties(t *testing.T) {
	t.Run("deduplicates case-insensitive matches", func(t *testing.T) {
		result := normalizeSpecialties([]string{"Bilingual", "bilingual", "BILINGUAL"})
		if len(result) != 1 || result[0] != "Bilingual" {
			t.Errorf("expected [Bilingual], got %v", result)
		}
	})

	t.Run("drops unknown values", func(t *testing.T) {
		result := normalizeSpecialties([]string{"Bilingual", "unknown"})
		if len(result) != 1 || result[0] != "Bilingual" {
			t.Errorf("expected [Bilingual], got %v", result)
		}
	})

	t.Run("empty input returns empty slice", func(t *testing.T) {
		result := normalizeSpecialties([]string{})
		if len(result) != 0 {
			t.Errorf("expected empty, got %v", result)
		}
	})

	t.Run("all valid specialties preserved", func(t *testing.T) {
		input := []string{"Infant care", "Special needs", "Montessori", "CPR certified", "Bilingual"}
		result := normalizeSpecialties(input)
		if len(result) != 5 {
			t.Errorf("expected 5 specialties, got %d: %v", len(result), result)
		}
	})
}

func TestAvatarUploadHelpers(t *testing.T) {
	t.Run("detects image type from bytes", func(t *testing.T) {
		cases := []struct {
			name string
			data []byte
			want string
		}{
			{name: "jpeg", data: []byte{0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00}, want: "image/jpeg"},
			{name: "png", data: []byte{0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a}, want: "image/png"},
			{name: "webp", data: []byte("RIFF\x24\x00\x00\x00WEBPVP8 "), want: "image/webp"},
			{name: "text", data: []byte("not an image"), want: "text/plain"},
		}

		for _, tc := range cases {
			t.Run(tc.name, func(t *testing.T) {
				got := detectAvatarContentType(tc.data)
				if got != tc.want {
					t.Fatalf("expected %s, got %s", tc.want, got)
				}
			})
		}
	})

	t.Run("deletes only when previous public id differs", func(t *testing.T) {
		if shouldDeletePreviousAvatar("", "next") {
			t.Fatal("empty previous public id should not be deleted")
		}
		if shouldDeletePreviousAvatar("same", "same") {
			t.Fatal("same public id should not be deleted")
		}
		if !shouldDeletePreviousAvatar("old", "next") {
			t.Fatal("different previous public id should be deleted")
		}
	})
}

// ── ListPublic ────────────────────────────────────────────────────────────────

func TestListPublic(t *testing.T) {
	ctx := context.Background()

	newPipe := func(nr *mockNannyRepo) *NannyPipe {
		return NewNannyPipe(nr, &mockProfileRepo{})
	}

	t.Run("page < 1 normalised to 1", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{nannies: []models.NannyProfile{}, nanniesTotal: 0})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Page: 0, Limit: 10})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Page != 1 {
			t.Errorf("expected page 1, got %d", res.Data.Page)
		}
	})

	t.Run("limit < 1 defaults to 12", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Page: 1, Limit: 0})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Limit != 12 {
			t.Errorf("expected limit 12, got %d", res.Data.Limit)
		}
	})

	t.Run("limit > 50 clamped to 50", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Page: 1, Limit: 200})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Limit != 50 {
			t.Errorf("expected limit 50, got %d", res.Data.Limit)
		}
	})

	t.Run("negative min_rate rejected", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{MinRate: -1})
		if res.Success || string(res.Message) != messages.Invalid_Public_Query {
			t.Errorf("expected %s, got success=%v msg=%s", messages.Invalid_Public_Query, res.Success, res.Message)
		}
	})

	t.Run("negative max_rate rejected", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{MaxRate: -1})
		if res.Success || string(res.Message) != messages.Invalid_Public_Query {
			t.Errorf("expected %s, got %s", messages.Invalid_Public_Query, res.Message)
		}
	})

	t.Run("min_rate > max_rate rejected", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{MinRate: 50, MaxRate: 20})
		if res.Success || string(res.Message) != messages.Invalid_Public_Query {
			t.Errorf("expected %s, got %s", messages.Invalid_Public_Query, res.Message)
		}
	})

	t.Run("invalid service_type rejected", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{ServiceType: "cleaner"})
		if res.Success || string(res.Message) != messages.Invalid_Public_Query {
			t.Errorf("expected %s, got %s", messages.Invalid_Public_Query, res.Message)
		}
	})

	t.Run("unknown specialty rejected", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Specialties: []string{"Dog walking"}})
		if res.Success || string(res.Message) != messages.Invalid_Public_Query {
			t.Errorf("expected %s, got %s", messages.Invalid_Public_Query, res.Message)
		}
	})

	t.Run("invalid sort rejected", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Sort: "magic"})
		if res.Success || string(res.Message) != messages.Invalid_Public_Query {
			t.Errorf("expected %s, got %s", messages.Invalid_Public_Query, res.Message)
		}
	})

	t.Run("repo error returns failure", func(t *testing.T) {
		p := newPipe(&mockNannyRepo{nanniesErr: errors.New("db")})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Page: 1, Limit: 10})
		if res.Success {
			t.Errorf("expected failure on repo error")
		}
	})

	t.Run("success maps items correctly", func(t *testing.T) {
		nannies := []models.NannyProfile{
			{
				ID: uuid.New(), DisplayName: "Jane", City: "Toronto",
				Province: "ON", RatePerHour: 28.0, Specialties: []string{"Bilingual"},
				ServiceType: models.NannyServiceType, Currency: models.CAD,
			},
		}
		p := newPipe(&mockNannyRepo{nannies: nannies, nanniesTotal: 1})
		res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Page: 1, Limit: 10})
		if !res.Success || string(res.Message) != messages.Nannies_Fetched {
			t.Fatalf("expected success, got success=%v msg=%s", res.Success, res.Message)
		}
		if res.Data.Total != 1 || len(res.Data.Items) != 1 {
			t.Fatalf("expected 1 item, got %d", len(res.Data.Items))
		}
		item := res.Data.Items[0]
		if item.DisplayName != "Jane" || item.City != "Toronto" || item.RatePerHour != 28.0 {
			t.Errorf("item fields mismatch: %+v", item)
		}
		if len(item.Specialties) != 1 || item.Specialties[0] != "Bilingual" {
			t.Errorf("specialties mismatch: %v", item.Specialties)
		}
	})

	validSorts := []string{"", "newest", "oldest", "rate_asc", "rate_desc", "rating_desc"}
	for _, s := range validSorts {
		sort := s
		t.Run("valid sort accepted: "+sort, func(t *testing.T) {
			p := newPipe(&mockNannyRepo{})
			res := p.ListPublic(ctx, dtos.ListPublicNanniesQuery{Sort: sort})
			if !res.Success {
				t.Errorf("sort %q should be accepted, got msg=%s", sort, res.Message)
			}
		})
	}
}

// ── GetPublicByID ─────────────────────────────────────────────────────────────

func TestGetPublicByID(t *testing.T) {
	ctx := context.Background()
	nannyID := uuid.New()

	t.Run("nanny not found", func(t *testing.T) {
		p := NewNannyPipe(&mockNannyRepo{}, &mockProfileRepo{})
		res := p.GetPublicByID(ctx, nannyID)
		if res.Success || string(res.Message) != messages.Nanny_Not_Found {
			t.Errorf("expected %s, got success=%v msg=%s", messages.Nanny_Not_Found, res.Success, res.Message)
		}
	})

	t.Run("repo error", func(t *testing.T) {
		p := NewNannyPipe(&mockNannyRepo{nannyErr: errors.New("db")}, &mockProfileRepo{})
		res := p.GetPublicByID(ctx, nannyID)
		if res.Success || string(res.Message) != messages.Nanny_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Not_Found, res.Message)
		}
	})

	t.Run("success maps fields", func(t *testing.T) {
		nanny := models.NannyProfile{
			ID: uuid.New(), DisplayName: "Jane", City: "Ottawa",
			Province: "ON", RatePerHour: 30.0,
			VerificationStatus: models.VerifiedVerificationStatus,
		}
		p := NewNannyPipe(&mockNannyRepo{nanny: nanny}, &mockProfileRepo{})
		res := p.GetPublicByID(ctx, nannyID)
		if !res.Success || string(res.Message) != messages.Nanny_Profile_Fetched {
			t.Fatalf("expected success, got success=%v msg=%s", res.Success, res.Message)
		}
		if res.Data == nil {
			t.Fatal("expected data, got nil")
		}
		if res.Data.DisplayName != "Jane" || res.Data.City != "Ottawa" {
			t.Errorf("field mismatch: %+v", res.Data)
		}
		if res.Data.VerificationStatus != models.VerifiedVerificationStatus {
			t.Errorf("VerificationStatus mismatch")
		}
	})
}

// ── GetOwnProfile ─────────────────────────────────────────────────────────────

func TestGetOwnProfile(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()

	t.Run("profile not found", func(t *testing.T) {
		p := NewNannyPipe(&mockNannyRepo{}, &mockProfileRepo{})
		res := p.GetOwnProfile(ctx, userID)
		if res.Success || string(res.Message) != messages.Nanny_Not_Found {
			t.Errorf("expected %s, got success=%v msg=%s", messages.Nanny_Not_Found, res.Success, res.Message)
		}
	})

	t.Run("repo error", func(t *testing.T) {
		p := NewNannyPipe(&mockNannyRepo{}, &mockProfileRepo{nannyProfileErr: errors.New("db")})
		res := p.GetOwnProfile(ctx, userID)
		if res.Success || string(res.Message) != messages.Nanny_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Not_Found, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		profile := models.NannyProfile{ID: uuid.New(), DisplayName: "Jane"}
		p := NewNannyPipe(&mockNannyRepo{}, &mockProfileRepo{nannyProfile: profile})
		res := p.GetOwnProfile(ctx, userID)
		if !res.Success || string(res.Message) != messages.Nanny_Profile_Fetched {
			t.Fatalf("expected success, got success=%v msg=%s", res.Success, res.Message)
		}
		if res.Data == nil || res.Data.DisplayName != "Jane" {
			t.Errorf("data mismatch: %+v", res.Data)
		}
	})
}

// ── UpdateOwnProfile ──────────────────────────────────────────────────────────

func TestUpdateOwnProfile(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()

	validDTO := dtos.UpdateNannyProfileDTO{
		DisplayName: "Jane Doe",
		Bio:         "Experienced caregiver with 5 years.",
		Specialties: []string{"Bilingual", "infant care"},
		RatePerHour: 30.0,
		City:        "Toronto",
		Province:    "ON",
	}

	t.Run("repo error returns failure", func(t *testing.T) {
		pr := &mockProfileRepo{updateNannyErr: errors.New("db")}
		p := NewNannyPipe(&mockNannyRepo{}, pr)
		res := p.UpdateOwnProfile(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Nanny_Not_Found {
			t.Errorf("expected %s, got success=%v msg=%s", messages.Nanny_Not_Found, res.Success, res.Message)
		}
	})

	t.Run("profile not found (nil id)", func(t *testing.T) {
		pr := &mockProfileRepo{updatedNanny: models.NannyProfile{}}
		p := NewNannyPipe(&mockNannyRepo{}, pr)
		res := p.UpdateOwnProfile(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Nanny_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Not_Found, res.Message)
		}
	})

	t.Run("specialties normalised and deduplicated", func(t *testing.T) {
		updated := models.NannyProfile{ID: uuid.New(), DisplayName: "Jane Doe"}
		pr := &mockProfileRepo{updatedNanny: updated}
		p := NewNannyPipe(&mockNannyRepo{}, pr)

		dto := validDTO
		dto.Specialties = []string{"bilingual", "BILINGUAL", "Montessori"}
		res := p.UpdateOwnProfile(ctx, userID, dto)
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
	})

	t.Run("display name and fields trimmed", func(t *testing.T) {
		updated := models.NannyProfile{ID: uuid.New(), DisplayName: "Jane Doe"}
		pr := &mockProfileRepo{updatedNanny: updated}
		p := NewNannyPipe(&mockNannyRepo{}, pr)
		res := p.UpdateOwnProfile(ctx, userID, validDTO)
		if !res.Success || string(res.Message) != messages.Nanny_Profile_Updated {
			t.Fatalf("expected success %s, got success=%v msg=%s", messages.Nanny_Profile_Updated, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.DisplayName != "Jane Doe" {
			t.Errorf("data mismatch: %+v", res.Data)
		}
	})
}
