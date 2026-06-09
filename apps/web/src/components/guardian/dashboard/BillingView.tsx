"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe, type Stripe, type StripeCardElement } from "@stripe/stripe-js";
import SectionCard from "../profile/SectionCard";
import {
  createParentSetupIntent,
  deleteParentPaymentMethod,
  listParentPaymentMethods,
  parentPaymentMethodsQueryKey,
  setDefaultParentPaymentMethod,
} from "@/src/utils/api/payments";


const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function BillingView() {
  const queryClient = useQueryClient();
  const [editPayment, setEditPayment] = useState(false);
  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");
  const cardElementRef = useRef<StripeCardElement | null>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const setupMutation = useMutation({ mutationFn: createParentSetupIntent });
  const methodsQuery = useQuery({
    queryKey: parentPaymentMethodsQueryKey,
    queryFn: async () => listParentPaymentMethods(),
  });
  const setDefaultMutation = useMutation({
    mutationFn: setDefaultParentPaymentMethod,
    onSuccess: async () => {
      setCardSuccess("Default card updated.");
      await queryClient.invalidateQueries({ queryKey: parentPaymentMethodsQueryKey });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteParentPaymentMethod,
    onSuccess: async () => {
      setCardSuccess("Card removed.");
      await queryClient.invalidateQueries({ queryKey: parentPaymentMethodsQueryKey });
    },
  });
  const paymentMethods = methodsQuery.data?.data?.items ?? [];
  const hasSavedCard = paymentMethods.length > 0;

  useEffect(() => {
    let active = true;
    if (!editPayment || !stripePublishableKey) return;

    async function mountCard() {
      try {
        const stripe = await stripePromise;
        if (!active || !stripe) return;
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
      const paymentMethod = result.setupIntent?.payment_method;
      const paymentMethodID = typeof paymentMethod === "string" ? paymentMethod : paymentMethod?.id;
      if (paymentMethodID) {
        try {
          await setDefaultParentPaymentMethod(paymentMethodID);
        } catch (error) {
          await queryClient.invalidateQueries({ queryKey: parentPaymentMethodsQueryKey });
          setCardError(
            error instanceof Error
              ? `Card saved in Stripe, but KinSittr could not set it as default: ${error.message}`
              : "Card saved in Stripe, but KinSittr could not set it as default.",
          );
          return;
        }
      }
      await queryClient.invalidateQueries({ queryKey: parentPaymentMethodsQueryKey });
      setCardSuccess("Card saved successfully.");
      setEditPayment(false);
    } catch (error) {
      setCardError(error instanceof Error ? error.message : "Unable to save card.");
    }
  };

  return (
    <div className="max-w-[620px] mx-auto px-9 pt-10 pb-[60px] overflow-y-auto h-full">
      <div className="mb-9">
        <h1 className="font-display font-normal text-[30px] mb-1">
          Billing
        </h1>
        <p className="text-[var(--faint)] text-[14px]">
          Manage your payment methods and billing preferences
        </p>
      </div>

      <SectionCard title="Payment Method">
        {!editPayment ? (
          <div>
            <div className="flex flex-col items-start md:flex-row md:items-center gap-4 bg-[var(--bg-warm)] border border-brand-border rounded-xl px-5 py-[18px] mb-4">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="w-[52px] h-[34px] bg-[linear-gradient(135deg,#1a3a6e,#2a5cb8)] rounded-lg flex items-center justify-center text-white text-[11px] font-extrabold tracking-[0.06em] shrink-0">
                  VISA
                </div>
                <div className="flex-1">
                  {methodsQuery.isLoading ? (
                    <div className="text-[13px] text-brand-faint">Loading saved cards...</div>
                  ) : hasSavedCard ? (
                    <div className="grid gap-[10px]">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                          <div>
                            <div className="font-semibold text-[15px] tracking-[0.04em]">
                              {method.brand.toUpperCase()} •••• {method.last4}
                            </div>
                            <div className="text-[13px] text-brand-faint mt-[2px]">
                              Expires {method.exp_month}/{method.exp_year}
                            </div>
                          </div>
                          {method.is_default ? (
                            <span className="text-teal text-[12.5px] font-semibold">Default</span>
                          ) : (
                            <button className="btn-outline text-[12px] px-[10px] py-[6px]" onClick={() => setDefaultMutation.mutate(method.id)}>
                              Set default
                            </button>
                          )}
                          <button
                            className="btn-outline text-[12px] px-[10px] py-[6px] text-[#c0392b]"
                            onClick={() => deleteMutation.mutate(method.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-[15px] tracking-[0.06em]">No saved card yet</div>
                      <div className="text-[13px] text-brand-faint mt-[2px]">
                        Add a card before requesting paid bookings.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {cardSuccess && <p className="text-teal text-[13px] mb-[14px]">{cardSuccess}</p>}
            {(methodsQuery.error || setDefaultMutation.error || deleteMutation.error) && (
              <p className="text-[#c0392b] text-[13px] mb-[14px]">
                {[methodsQuery.error, setDefaultMutation.error, deleteMutation.error].find(Boolean) instanceof Error
                  ? ([methodsQuery.error, setDefaultMutation.error, deleteMutation.error].find(Boolean) as Error).message
                  : "Unable to update payment methods."}
              </p>
            )}
            <div className="flex flex-col md:flex-row gap-[10px]">
              <button
                className="btn-outline text-[13px] px-4 py-2"
                onClick={() => {
                  setEditPayment(true);
                }}
              >
                {hasSavedCard ? "Change card" : "Add card"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-warm)] border border-brand-border rounded-xl px-5 py-[22px]">
            <p className="text-[13px] text-[var(--faint)] mb-[18px]">
              Enter your card details below. Stripe stores the card securely; KinSittr never stores full card numbers.
            </p>
            <label className="text-[12px] font-medium text-[var(--faint)] block mb-[6px] uppercase tracking-[0.06em]">Card details</label>
            <div
              id="stripe-card-element"
              className="w-full border-[1.5px] border-brand-border rounded-[9px] px-[14px] py-[11px] text-[14px] outline-none bg-[var(--bg-warm)] text-[var(--brand-text)] [font-family:inherit] min-h-[44px]"
            />
            {cardError && <p className="text-[#c0392b] text-[13px] mt-3">{cardError}</p>}
            <div className="flex gap-[10px] mt-[18px]">
              <button
                className="btn-cta text-[14px] px-5 py-[10px]"
                disabled={setupMutation.isPending}
                onClick={saveCard}
              >
                {setupMutation.isPending ? "Saving..." : "Save card"}
              </button>
              <button className="btn-outline text-[14px] px-5 py-[10px]" onClick={() => setEditPayment(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
