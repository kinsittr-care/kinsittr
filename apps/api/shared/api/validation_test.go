package api

import (
	"strings"
	"testing"

	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	nannyDtos "github.com/kinsittr/kinsittr-api/nanny/dtos"
)

// ── ValidateAPIData ───────────────────────────────────────────────────────────

func TestValidateAPIData(t *testing.T) {
	t.Run("valid struct passes", func(t *testing.T) {
		ok, err := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:   "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			Date:      "2026-08-15",
			StartTime: "10:00",
			Duration:  3,
		})
		if !ok || err != nil {
			t.Errorf("expected valid, got ok=%v err=%v", ok, err)
		}
	})

	t.Run("missing required fields fails", func(t *testing.T) {
		ok, fiberErr := ValidateAPIData(dtos.CreateBookingDTO{})
		if ok || fiberErr == nil {
			t.Error("expected validation failure for empty DTO")
		}
	})

	t.Run("invalid NannyID (not uuid4) fails", func(t *testing.T) {
		ok, fiberErr := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:   "not-a-uuid",
			Date:      "2026-08-15",
			StartTime: "10:00",
			Duration:  2,
		})
		if ok || fiberErr == nil {
			t.Error("expected failure for invalid uuid")
		}
		if !strings.Contains(fiberErr.Message, "NannyID") {
			t.Errorf("error message should mention NannyID, got: %s", fiberErr.Message)
		}
	})

	t.Run("invalid Date format fails", func(t *testing.T) {
		ok, _ := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:   "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			Date:      "15/08/2026",
			StartTime: "10:00",
			Duration:  2,
		})
		if ok {
			t.Error("expected failure for wrong date format")
		}
	})

	t.Run("invalid StartTime format fails", func(t *testing.T) {
		ok, _ := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:   "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			Date:      "2026-08-15",
			StartTime: "10:00:00",
			Duration:  2,
		})
		if ok {
			t.Error("expected failure for wrong time format")
		}
	})

	t.Run("duration 0 fails", func(t *testing.T) {
		ok, _ := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:   "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			Date:      "2026-08-15",
			StartTime: "10:00",
			Duration:  0,
		})
		if ok {
			t.Error("expected failure for duration 0")
		}
	})

	t.Run("duration 25 fails", func(t *testing.T) {
		ok, _ := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:   "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			Date:      "2026-08-15",
			StartTime: "10:00",
			Duration:  25,
		})
		if ok {
			t.Error("expected failure for duration > 24")
		}
	})

	t.Run("timezone offset below -840 fails", func(t *testing.T) {
		ok, _ := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:               "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			Date:                  "2026-08-15",
			StartTime:             "10:00",
			Duration:              2,
			TimezoneOffsetMinutes: -841,
		})
		if ok {
			t.Error("expected failure for timezone offset below -840")
		}
	})

	t.Run("timezone offset above 840 fails", func(t *testing.T) {
		ok, _ := ValidateAPIData(dtos.CreateBookingDTO{
			NannyID:               "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			Date:                  "2026-08-15",
			StartTime:             "10:00",
			Duration:              2,
			TimezoneOffsetMinutes: 841,
		})
		if ok {
			t.Error("expected failure for timezone offset above 840")
		}
	})
}

func TestValidateNannyProfileDTO(t *testing.T) {
	validDTO := nannyDtos.UpdateNannyProfileDTO{
		DisplayName: "Jane Doe",
		Phone:       "+14165550100",
		Bio:         "Experienced caregiver with 5 years of childcare.",
		RatePerHour: 28.0,
		City:        "Toronto",
		Province:    "ON",
	}

	t.Run("valid DTO passes", func(t *testing.T) {
		ok, err := ValidateAPIData(validDTO)
		if !ok || err != nil {
			t.Errorf("expected valid, got ok=%v err=%v", ok, err)
		}
	})

	t.Run("display name too short fails", func(t *testing.T) {
		dto := validDTO
		dto.DisplayName = "J"
		ok, _ := ValidateAPIData(dto)
		if ok {
			t.Error("expected failure for display name < 2 chars")
		}
	})

	t.Run("bio too short fails", func(t *testing.T) {
		dto := validDTO
		dto.Bio = "short"
		ok, _ := ValidateAPIData(dto)
		if ok {
			t.Error("expected failure for bio < 10 chars")
		}
	})

	t.Run("rate <= 0 fails", func(t *testing.T) {
		dto := validDTO
		dto.RatePerHour = 0
		ok, _ := ValidateAPIData(dto)
		if ok {
			t.Error("expected failure for rate_per_hour = 0")
		}
	})

	t.Run("city too short fails", func(t *testing.T) {
		dto := validDTO
		dto.City = "X"
		ok, _ := ValidateAPIData(dto)
		if ok {
			t.Error("expected failure for city < 2 chars")
		}
	})
}
