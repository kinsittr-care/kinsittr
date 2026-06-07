"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Navbar, Footer } from "@/src/components/landing";
import Avatar from "@/src/components/guardian/dashboard/Avatar";
import Tag from "@/src/components/guardian/dashboard/Tag";
import type { PublicNannyProfile, Review } from "@/src/types/api/api";
import { getPublicNannyProfile, publicNannyProfileQueryKey } from "@/src/utils/api/nanny";
import { listPublicNannyReviews, publicNannyReviewsQueryKey } from "@/src/utils/api/reviews";
import { formatCurrency } from "@/src/utils/format";

interface PublicNannyProfileViewProps {
  nannyId: string;
}

const PUBLIC_REVIEW_PARAMS = { page: 1, limit: 3 } as const;

export default function PublicNannyProfileView({ nannyId }: PublicNannyProfileViewProps) {
  const profileQuery = useQuery({
    queryKey: publicNannyProfileQueryKey(nannyId),
    queryFn: () => getPublicNannyProfile(nannyId),
  });
  const reviewsQuery = useQuery({
    queryKey: publicNannyReviewsQueryKey(nannyId, PUBLIC_REVIEW_PARAMS),
    queryFn: () => listPublicNannyReviews(nannyId, PUBLIC_REVIEW_PARAMS),
  });

  const profile = profileQuery.data?.data;
  const reviews = reviewsQuery.data?.data?.items ?? [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-5 pb-20 pt-28 sm:px-8 lg:px-14" style={{ background: "var(--bg-warm)" }}>
        {profileQuery.isLoading && <StateCard title="Loading profile..." />}
        {profileQuery.isError && (
          <StateCard
            title="Profile unavailable"
            description={profileQuery.error instanceof Error ? profileQuery.error.message : "This nanny profile is not available."}
          />
        )}
        {profile && <ProfileContent profile={profile} reviews={reviews} />}
      </main>
      <Footer />
    </>
  );
}

function ProfileContent({ profile, reviews }: { profile: PublicNannyProfile; reviews: Review[] }) {
  const initials = getInitials(profile.display_name);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-[28px] border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar initials={initials} src={profile.avatar_url} size={88} />
          <div className="flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--teal)" }}>
                  Verified nanny
                </p>
                <h1 className="font-display text-4xl font-normal leading-tight sm:text-5xl" style={{ color: "var(--brand-text)" }}>
                  {profile.display_name}
                </h1>
                <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
                  {profile.city}, {profile.province}
                </p>
              </div>
              <div className="rounded-2xl px-5 py-4 text-left sm:text-right" style={{ background: "var(--teal-lt)" }}>
                <p className="text-3xl font-bold leading-none" style={{ color: "var(--teal)" }}>
                  {formatCurrency(profile.rate_per_hour, profile.currency)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
                  per hour
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {profile.specialties.map((specialty) => (
                <Tag key={specialty} label={specialty} variant="green" />
              ))}
            </div>

            <p className="mt-7 text-[15px] leading-8" style={{ color: "#5c5446" }}>
              {profile.bio || "This nanny has not added a bio yet."}
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <SummaryCard profile={profile} />
        <ReviewCard reviews={reviews} ratingCount={profile.rating_count} />
        <div className="rounded-[24px] border bg-white p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>Interested in booking?</h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
            Sign in as a parent to message this nanny and request a booking.
          </p>
          <Link href="/auth/parent" className="btn-nav mt-5 inline-flex">
            Find a nanny
          </Link>
        </div>
      </aside>
    </div>
  );
}

function SummaryCard({ profile }: { profile: PublicNannyProfile }) {
  return (
    <div className="rounded-[24px] border bg-white p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <h2 className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>Profile summary</h2>
      <dl className="mt-5 space-y-4 text-sm">
        <SummaryRow label="Rating" value={`${profile.rating_avg.toFixed(1)} (${profile.rating_count})`} />
        <SummaryRow label="Location" value={`${profile.city}, ${profile.province}`} />
        <SummaryRow label="Status" value="Verified" />
      </dl>
    </div>
  );
}

function ReviewCard({ reviews, ratingCount }: { reviews: Review[]; ratingCount: number }) {
  return (
    <div className="rounded-[24px] border bg-white p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <h2 className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>Parent reviews</h2>
      {ratingCount === 0 ? (
        <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>No public reviews yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--brand-text)" }}>{review.rating}/5 stars</p>
              <p className="mt-1 line-clamp-3 text-sm leading-6" style={{ color: "var(--muted)" }}>{review.comment}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt style={{ color: "var(--muted)" }}>{label}</dt>
      <dd className="text-right font-semibold" style={{ color: "var(--brand-text)" }}>{value}</dd>
    </div>
  );
}

function StateCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-[24px] border bg-white p-8 text-center shadow-sm" style={{ borderColor: "var(--border)" }}>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--brand-text)" }}>{title}</h1>
      {description && <p className="mt-3 text-sm leading-6" style={{ color: "var(--muted)" }}>{description}</p>}
      <Link href="/" className="btn-nav mt-6 inline-flex">Back home</Link>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
