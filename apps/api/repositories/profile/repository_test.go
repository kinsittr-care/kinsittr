//go:build integration

package profile

// Integration tests for ProfileRepository.
// Run with: go test -tags integration ./repositories/profile/...
//
// Cases to cover:
//
//   CreateParentProfile / GetParentProfileByUserID
//     - creates a profile and retrieves it by user ID
//     - returns zero-value for unknown user ID
//
//   UpdateParentProfile
//     - persists changed fields and returns the updated row
//
//   DeleteParentProfile
//     - removes the profile; subsequent get returns zero-value
//
//   CreateNannyProfile / GetNannyProfileByUserID
//     - creates a nanny profile and retrieves it by user ID
//     - returns zero-value for unknown user ID
//
//   UpdateNannyProfile
//     - persists display name, bio, specialties, rate changes
//
//   DeleteNannyProfile
//     - removes the profile; subsequent get returns zero-value
