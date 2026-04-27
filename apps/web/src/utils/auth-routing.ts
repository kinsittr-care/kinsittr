import type { AuthSession, AuthUser } from "@/src/types/api/api";

export function getPostAuthRedirectPath(user: Pick<AuthUser, "role">) {
  return user.role === "nanny" ? "/nanny-resources" : "/";
}

export function getStoredRedirectPath(session: AuthSession) {
  return getPostAuthRedirectPath(session.user);
}
