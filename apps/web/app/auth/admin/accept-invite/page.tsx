import { Suspense } from "react";
import AdminAcceptInviteView from "@/src/components/auth/AdminAcceptInviteView";

export const metadata = { title: "Accept admin invite — KinSittr" };

export default function AdminAcceptInvitePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f1ec" }}>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-5" style={{ color: "#33271f" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "#8b5e3c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: 17,
                }}
              >
                k
              </div>
              <span
                style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: 22,
                  color: "#33271f",
                }}
              >
                KinSittr
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 400, margin: 0, color: "#33271f" }}>
              Accept admin invite
            </h1>
            <p style={{ marginTop: 8, fontSize: 14, color: "#7b7168" }}>
              Set your password to activate admin console access.
            </p>
          </div>

          <div
            className="bg-white rounded-[20px]"
            style={{
              padding: "32px 28px",
              border: "1px solid #e7ddd2",
              boxShadow: "0 4px 24px rgba(40,30,20,.07)",
            }}
          >
            <Suspense fallback={null}>
              <AdminAcceptInviteView />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
