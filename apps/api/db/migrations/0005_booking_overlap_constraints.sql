CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_parent_nanny_slot_excl;

ALTER TABLE bookings
ADD CONSTRAINT bookings_parent_nanny_slot_excl
EXCLUDE USING gist (
    parent_profile_id WITH =,
    nanny_profile_id WITH =,
    tsrange(start_time, start_time + (duration * INTERVAL '1 hour'), '[)') WITH &&
)
WHERE (status IN ('pending', 'approved'));

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_nanny_approved_slot_excl;

ALTER TABLE bookings
ADD CONSTRAINT bookings_nanny_approved_slot_excl
EXCLUDE USING gist (
    nanny_profile_id WITH =,
    tsrange(start_time, start_time + (duration * INTERVAL '1 hour'), '[)') WITH &&
)
WHERE (status = 'approved');
