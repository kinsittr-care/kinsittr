import { redirect } from "next/navigation";

export default function AccountPage() {
  redirect("/parent/profile");
}
