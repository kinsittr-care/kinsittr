import type { MessageThread } from "./types";

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
