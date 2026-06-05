"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import ParentRegisterForm from "./ParentRegisterForm";
import NannyRegisterForm from "./NannyRegisterForm";

type Tab = "login" | "register";

interface AuthTabsProps {
  role: "parent" | "nanny";
}

export default function AuthTabs({ role }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("login");

  return (
    <>
      <div
        className="flex rounded-[12px] p-[4px] mb-7"
        style={{ background: "var(--bg-warm)", border: "1px solid var(--border)" }}
      >
        {(["login", "register"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-[9px] py-[9px] text-[13px] font-semibold transition-all"
            style={{
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "var(--brand-text)" : "var(--faint)",
              boxShadow: activeTab === tab ? "0 1px 6px rgba(0,0,0,.08)" : "none",
            }}
          >
            {tab === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {activeTab === "login" && <LoginForm />}
      {activeTab === "register" && role === "parent" && (
        <ParentRegisterForm />
      )}
      {activeTab === "register" && role === "nanny" && (
        <NannyRegisterForm />
      )}
    </>
  );
}
