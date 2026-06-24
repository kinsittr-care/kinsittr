"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Navbar, Footer } from "@/src/components/landing";
import Avatar from "@/src/components/guardian/dashboard/Avatar";
import Tag from "@/src/components/guardian/dashboard/Tag";
import type { PublicNannyProfile, Review } from "@/src/types/api/api";
import { getPublicNannyProfile, publicNannyProfileQueryKey } from "@/src/utils/api/nanny";
import { listPublicNannyReviews, publicNannyReviewsQueryKey } from "@/src/utils/api/reviews";
import { formatCurrency, formatLocation } from "@/src/utils/format";

interface PublicNannyProfileViewProps {
  nannyId: string;
}

const PUBLIC_REVIEW_PARAMS = { page: 1, limit: 3 } as const;

export default function PublicNannyProfileView({ nannyId }: PublicNannyProfileViewProps) {
  const profileQuery = useQuery({
    queryKey: publicNannyProfileQueryKey(nannyId),
    queryFn: () => getPublicNannyProfile(nannyId),
  });
  const profile = profileQuery.data?.data;
  const reviewsQuery = useQuery({
    queryKey: publicNannyReviewsQueryKey(profile?.id ?? nannyId, PUBLIC_REVIEW_PARAMS),
    queryFn: () => listPublicNannyReviews(profile?.id ?? nannyId, PUBLIC_REVIEW_PARAMS),
    enabled: Boolean(profile?.id),
  });

  const reviews = reviewsQuery.data?.data?.items ?? [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-warm px-5 pb-20 pt-28 sm:px-8 lg:px-14">
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
      <section className="rounded-[28px] border border-(--border) bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4 sm:block">
            <div className="sm:hidden">
              <Avatar initials={initials} src={profile.avatar_url} size={72} />
            </div>
            <div className="hidden sm:block">
              <Avatar initials={initials} src={profile.avatar_url} size={88} />
            </div>
            <div className="min-w-0 sm:hidden">
              <h1 className="truncate font-display text-[28px] font-normal leading-tight text-brand-text">
                {profile.display_name}
              </h1>
              <p className="mt-1 text-xs text-brand-faint">
                {formatLocation(profile.city, profile.province)}
              </p>
              <p className="mb-1 text-[10px] sm:hidden font-bold uppercase tracking-[0.14em] text-teal">
                Verified childcare giver
              </p>
            </div>
            
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="hidden sm:block">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal">
                  Verified childcare giver
                </p>
                <h1 className="font-display text-4xl font-normal leading-tight text-brand-text sm:text-5xl">
                  {profile.display_name}
                </h1>
                <p className="mt-3 text-sm text-brand-faint">
                  {formatLocation(profile.city, profile.province)}
                </p>
              </div>
              <div className="w-fit rounded-2xl bg-teal-lt px-4 py-3 text-left sm:px-5 sm:py-4 sm:text-right">
                <p className="text-2xl font-bold leading-none text-teal sm:text-3xl">
                  {formatCurrency(profile.rate_per_hour, profile.currency)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-faint">
                  per hour
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {profile.specialties.map((specialty) => (
                <Tag key={specialty} label={specialty} variant="green" />
              ))}
            </div>

            <p className="mt-7 text-[15px] leading-8 text-[#5c5446]">
              {profile.bio || "This nanny has not added a bio yet."}
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <SummaryCard profile={profile} />
        {profile.rating_count > 0 && <ReviewCard reviews={reviews} />}
      </aside>
    </div>
  );
}

function SummaryCard({ profile }: { profile: PublicNannyProfile }) {
  return (
    <div className="rounded-[24px] border border-(--border) bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-text">Profile summary</h2>
      <dl className="mt-5 space-y-4 text-sm">
        {profile.rating_count > 0 && (
          <SummaryRow label="Rating" value={`${profile.rating_avg.toFixed(1)} (${profile.rating_count})`} />
        )}
        <SummaryRow label="Location" value={formatLocation(profile.city, profile.province)} />
        <SummaryRow label="Status" value="Verified" />
      </dl>
    </div>
  );
}

function ReviewCard({ reviews }: { reviews: Review[] }) {
  return (
    <div className="rounded-[24px] border border-(--border) bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-text">Parent reviews</h2>
      <div className="mt-4 space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="border-t border-(--border) pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <ReviewStars rating={review.rating} />
              <p className="m-0 text-sm font-semibold text-brand-text">
                {review.parent_display_name}
              </p>
            </div>
            <p className="mt-1 line-clamp-3 text-sm leading-6 text-brand-faint">{review.comment}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span
      className="inline-flex gap-0.5 text-[15px] leading-none"
      aria-label={`${normalizedRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={star <= normalizedRating ? "text-gold" : "text-brand-faint"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-brand-faint">{label}</dt>
      <dd className="text-right font-semibold text-brand-text">{value}</dd>
    </div>
  );
}

function StateCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-[24px] border border-(--border) bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-brand-text">{title}</h1>
      {description && <p className="mt-3 text-sm leading-6 text-brand-faint">{description}</p>}
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
