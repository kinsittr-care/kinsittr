export interface Nanny {
  id: string;
  name: string;
  initials: string;
  city: string;
  rate: number;
  rating: number;
  reviews: number;
  years?: number;
  bio: string;
  tags?: string[];
  available?: boolean;
}
