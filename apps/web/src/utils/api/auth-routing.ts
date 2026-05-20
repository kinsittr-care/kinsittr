import type { AuthSession, AuthUser } from "@/src/types/api/api";

export function getPostAuthRedirectPath(user: Pick<AuthUser, "role">) {
  if (user.role === "admin") return "/admin";
  if (user.role === "nanny") return "/nanny";
  return "/parent";
}

export function getStoredRedirectPath(session: AuthSession) {
  return getPostAuthRedirectPath(session.user);
}
