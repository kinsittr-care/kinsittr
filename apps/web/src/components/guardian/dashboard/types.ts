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

export interface ChatMessage {
  from: "nanny" | "user";
  text: string;
}

export interface MessageThread {
  id: number;
  nannyId: number;
  nannyName: string;
  nannyInitials: string;
  preview: string;
  time: string;
  online: boolean;
  chat: ChatMessage[];
}
