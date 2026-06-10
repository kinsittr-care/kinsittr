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
      <div className="mb-7 flex rounded-xl border border-[var(--border)] bg-[var(--bg-warm)] p-1">
        {(["login", "register"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-[9px] py-[9px] text-[13px] font-semibold transition-all ${activeTab === tab ? "bg-white text-[var(--brand-text)] shadow-[0_1px_6px_rgba(0,0,0,.08)]" : "bg-transparent text-[var(--faint)]"}`}
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
