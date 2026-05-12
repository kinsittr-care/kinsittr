package nanny

// Integration tests for NannyRepository.
// Run with: go test -tags integration ./repositories/nanny/...
//
// Cases to cover:
//
//   ListVerifiedNannies
//     - returns only profiles with verification_status = 'verified'
//     - paginates correctly (page, limit)
//     - filters by city (case-insensitive partial match or exact)
//     - filters by province
//     - filters by specialties (all requested specialties must be present)
//     - filters by min_rate / max_rate
//     - filters by service_type
//     - sorts by rate_asc, rate_desc, rating_desc, newest, oldest
//     - returns correct total count independent of page size
//
//   GetVerifiedNannyByID
//     - returns the nanny profile when verified
//     - returns zero-value for an unverified profile
//     - returns zero-value for an unknown ID
