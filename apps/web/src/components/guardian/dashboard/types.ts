export interface Nanny {
  id: string;
  publicSlug?: string;
  name: string;
  initials: string;
  city: string;
  rate: number;
  rating: number;
  reviews: number;
  years?: number;
  bio: string;
  avatarUrl?: string;
  tags?: string[];
  available?: boolean;
}
