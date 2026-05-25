"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import SectionCard from "../profile/SectionCard";
import { createParentSetupIntent } from "@/src/utils/api/payments";

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  fontFamily: "inherit",
  marginBottom: 16,
};

type StripeCardElement = {
  mount: (selector: string) => void;
  destroy: () => void;
};

type StripeElements = {
  create: (type: "card", options?: object) => StripeCardElement;
};

type StripeInstance = {
  elements: () => StripeElements;
  confirmCardSetup: (
    clientSecret: string,
    data: { payment_method: { card: StripeCardElement } },
  ) => Promise<{ error?: { message?: string } }>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

function loadStripeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[src='https://js.stripe.com/v3/']");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Stripe.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Stripe."));
    document.body.appendChild(script);
  });
}

export default function BillingView() {
  const [editPayment, setEditPayment] = useState(false);
  const [hasSavedCard, setHasSavedCard] = useState(false);
  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");
  const cardElementRef = useRef<StripeCardElement | null>(null);
  const stripeRef = useRef<StripeInstance | null>(null);
  const setupMutation = useMutation({ mutationFn: createParentSetupIntent });

  useEffect(() => {
    let active = true;
    if (!editPayment || !stripePublishableKey) return;

    async function mountCard() {
      try {
        await loadStripeScript();
        if (!active || !window.Stripe || !stripePublishableKey) return;
        const stripe = window.Stripe(stripePublishableKey);
        const card = stripe.elements().create("card", {
          style: {
            base: {
              color: "#2f241d",
              fontSize: "15px",
              fontFamily: "inherit",
              "::placeholder": { color: "#9b8f86" },
            },
          },
        });
        stripeRef.current = stripe;
        cardElementRef.current = card;
        card.mount("#stripe-card-element");
      } catch (error) {
        setCardError(error instanceof Error ? error.message : "Unable to initialize Stripe.");
      }
    }

    void mountCard();
    return () => {
      active = false;
      cardElementRef.current?.destroy();
      cardElementRef.current = null;
      stripeRef.current = null;
    };
  }, [editPayment]);

  const saveCard = async () => {
    setCardError("");
    setCardSuccess("");
    if (!stripePublishableKey) {
      setCardError("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required to save cards.");
      return;
    }
    if (!stripeRef.current || !cardElementRef.current) {
      setCardError("Stripe is still loading. Try again in a moment.");
      return;
    }
    try {
      const response = await setupMutation.mutateAsync();
      const clientSecret = response.data?.client_secret;
      if (!clientSecret) {
        setCardError("Unable to start card setup.");
        return;
      }
      const result = await stripeRef.current.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElementRef.current },
      });
      if (result.error) {
        setCardError(result.error.message ?? "Unable to save card.");
        return;
      }
      setHasSavedCard(true);
      setCardSuccess("Card saved successfully.");
      setEditPayment(false);
    } catch (error) {
      setCardError(error instanceof Error ? error.message : "Unable to save card.");
    }
  };

  return (
    <div
      style={{
        maxWidth: 620,
        margin: "0 auto",
        padding: "40px 36px 60px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <h1 className="font-display" style={{ fontWeight: 400, fontSize: 30, marginBottom: 4 }}>
          Billing
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Manage your payment methods and billing preferences
        </p>
      </div>

      <SectionCard title="Payment Method">
        {!editPayment ? (
          <div>
            <div
              className="flex flex-col items-start md:flex-row md:items-center gap-4"
              style={{
                background: "var(--bg-warm)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "18px 20px",
                marginBottom: 16,
              }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div
                  style={{
                    width: 52,
                    height: 34,
                    background: "linear-gradient(135deg, #1a3a6e, #2a5cb8)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                  }}
                >
                  VISA
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "0.06em" }}>
                    {hasSavedCard ? "Saved card on file" : "No saved card yet"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 2 }}>
                    {hasSavedCard ? "Stripe stores the card securely for booking payments." : "Add a card before requesting paid bookings."}
                  </div>
                </div>
              </div>
              {hasSavedCard && (
                <span
                  style={{
                    background: "var(--teal-lt)",
                    color: "var(--teal)",
                    border: "1px solid var(--teal-mid)",
                    borderRadius: 20,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  ✓ Default
                </span>
              )}
            </div>
            {cardSuccess && <p style={{ color: "var(--teal)", fontSize: 13, marginBottom: 14 }}>{cardSuccess}</p>}
            <div className="flex flex-col md:flex-row gap-[10px]">
              <button
                className="btn-outline"
                style={{ fontSize: 13, padding: "8px 16px" }}
                onClick={() => {
                  setEditPayment(true);
                }}
              >
                {hasSavedCard ? "Change card" : "Add card"}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--bg-warm)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "22px 20px",
            }}
          >
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
              Enter your card details below. Stripe stores the card securely; KinSittr never stores full card numbers.
            </p>
            <label style={labelStyle}>Card details</label>
            <div id="stripe-card-element" style={{ ...inputStyle, minHeight: 44, marginBottom: 0 }} />
            {cardError && <p style={{ color: "#c0392b", fontSize: 13, margin: "12px 0 0" }}>{cardError}</p>}
            <div className="flex gap-[10px]" style={{ marginTop: 18 }}>
              <button
                className="btn-cta"
                style={{ fontSize: 14, padding: "10px 20px" }}
                disabled={setupMutation.isPending}
                onClick={saveCard}
              >
                {setupMutation.isPending ? "Saving..." : "Save card"}
              </button>
              <button className="btn-outline" style={{ fontSize: 14, padding: "10px 20px" }} onClick={() => setEditPayment(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
