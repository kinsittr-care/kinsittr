import { ContactFormPayload } from "@/src/types/api/api";
import { apiRequest } from "./api";

export async function sendContactMessage(payload: ContactFormPayload) {
    return apiRequest("/api/v1/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }