import type { Nanny, MessageThread } from "./types";

export const NANNIES: Nanny[] = [
  {
    id: 1, name: "Sarah Okonkwo", initials: "SO", city: "Toronto, ON",
    rate: 28, rating: 4.9, reviews: 47, years: 6, available: true,
    bio: "6 years caring for children aged 0–8. Former early childhood educator. Warm, patient, and bilingual in English and Yoruba. Experienced with newborns, toddlers, and school-age children.",
    tags: ["Infant care", "CPR certified", "English"],
  },
  {
    id: 2, name: "Marie-Claire Beaumont", initials: "MB", city: "Vancouver, BC",
    rate: 32, rating: 4.8, reviews: 31, years: 8, available: true,
    bio: "8 years experience specializing in Montessori methods and children with diverse developmental needs. Former Montessori classroom assistant. Warm, structured, and nurturing.",
    tags: ["Special needs", "Montessori", "English"],
  },
  {
    id: 3, name: "Priya Sharma", initials: "PS", city: "Toronto, ON",
    rate: 25, rating: 4.7, reviews: 22, years: 4, available: false,
    bio: "Experienced nanny with a background in early childhood education. Fluent in English and Hindi. Loves outdoor activities, arts and crafts, and building strong routines.",
    tags: ["Bilingual", "Infant care", "Montessori"],
  },
  {
    id: 4, name: "Aisha Mensah", initials: "AM", city: "Calgary, AB",
    rate: 30, rating: 4.9, reviews: 58, years: 10, available: true,
    bio: "10 years working with families across Canada. Specializes in newborns and toddlers. CPR and first aid certified. Dependable, kind, and communicates excellently.",
    tags: ["Infant care", "CPR certified", "Special needs"],
  },
];

export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: 1, nannyId: 1, nannyName: "Sarah Okonkwo", nannyInitials: "SO",
    preview: "Hi! I'd love to help with...", time: "2h", online: true,
    chat: [
      { from: "nanny", text: "Hi! I saw your inquiry about childcare for April 15th. I'd love to help! Could you tell me more about your little ones?" },
      { from: "user", text: "Hi Sarah! We have two kids, ages 3 and 6. Looking for 8am–4pm. They're both very active and love outdoor play!" },
      { from: "nanny", text: "That sounds wonderful! I have a great outdoor activity program and plenty of experience with active kids. Do you have a preferred start date in mind?" },
    ],
  },
  {
    id: 2, nannyId: 2, nannyName: "Marie-Claire Beaumont", nannyInitials: "MB",
    preview: "Hello! I'd love to discuss...", time: "1d", online: false,
    chat: [
      { from: "nanny", text: "Hello! I saw your booking request. I'd love to discuss how I can support your children's development!" },
    ],
  },
  {
    id: 3, nannyId: 3, nannyName: "Priya Sharma", nannyInitials: "PS",
    preview: "Hi there! I'm so excited...", time: "3d", online: false,
    chat: [
      { from: "nanny", text: "Hi there! I'm so excited to potentially work with your family. When would you like to chat?" },
    ],
  },
  {
    id: 4, nannyId: 4, nannyName: "Aisha Mensah", nannyInitials: "AM",
    preview: "Hello! I specialize in infant...", time: "1w", online: true,
    chat: [
      { from: "nanny", text: "Hello! I specialize in infant and toddler care. I'd love to hear more about your family's needs." },
    ],
  },
];
