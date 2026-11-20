"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export type PaymentState =
    | { status: "idle" }
    | { status: "creating" }
    | { status: "modal_open"; orderId: string }
    | { status: "verifying"; orderId: string }
    | { status: "success"; paymentId: string; receiptNumber?: string }
    | { status: "error"; message: string; retryable: boolean };

export type PaymentAction =
    | { type: "START" }
    | { type: "ORDER_CREATED"; orderId: string }
    | { type: "MODAL_DISMISSED" }
    | { type: "PAYMENT_AUTHORIZED"; orderId?: string }
    | { type: "VERIFIED"; paymentId: string; receiptNumber?: string }
    | { type: "FAILED"; message: string; retryable?: boolean }
    | { type: "RESET" };

export function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
    switch (action.type) {
        case "START":
            if (state.status === "idle" || state.status === "error") {
                return { status: "creating" };
            }
            return state;

        case "ORDER_CREATED":
            if (state.status === "creating") {
                return { status: "modal_open", orderId: action.orderId };
            }
            return state;

        case "MODAL_DISMISSED":
            if (state.status === "modal_open") {
                return { status: "idle" };
            }
            // In 'verifying' or 'success' state, ignore modal dismiss
            return state;

        case "PAYMENT_AUTHORIZED":
            if (state.status === "modal_open") {
                return {
                    status: "verifying",
                    orderId: action.orderId || state.orderId,
                };
            }
            return state;

        case "VERIFIED":
            if (state.status === "verifying") {
                return {
                    status: "success",
                    paymentId: action.paymentId,
                    receiptNumber: action.receiptNumber,
                };
            }
            return state;

        case "FAILED":
            if (
                state.status === "creating" ||
                state.status === "modal_open" ||
                state.status === "verifying"
            ) {
                return {
                    status: "error",
                    message: action.message,
                    retryable: action.retryable ?? true,
                };
            }
            return state;

        case "RESET":
            return { status: "idle" };

        default:
            return state;
    }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayScriptElement extends HTMLScriptElement {
    _loaded?: boolean;
}

export function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(false);
            return;
        }

        const win = window as unknown as { Razorpay?: unknown };
        if (win.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector<RazorpayScriptElement>(
            `script[src="${RAZORPAY_SCRIPT_SRC}"]`
        );

        if (existingScript) {
            if (existingScript._loaded || win.Razorpay) {
                resolve(true);
                return;
            }
            existingScript.addEventListener("load", () => resolve(true), { once: true });
            existingScript.addEventListener("error", () => resolve(false), { once: true });
            return;
        }

        const script = document.createElement("script") as RazorpayScriptElement;
        script.src = RAZORPAY_SCRIPT_SRC;
        script.async = true;
        script.onload = () => {
            script._loaded = true;
            resolve(true);
        };
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export interface UsePaymentFlowConfig<TFormData, TContext = unknown> {
    createOrder: (data: TFormData) => Promise<{
        orderId: string;
        razorpayOptions: Record<string, unknown>;
        context?: TContext;
    }>;
    verifyPayment: (
        response: {
            razorpay_payment_id: string;
            razorpay_order_id?: string;
            razorpay_signature?: string;
        },
        context?: TContext
    ) => Promise<{
        paymentId: string;
        receiptNumber?: string;
        data?: unknown;
    }>;
    onSuccess?: (result: { paymentId: string; receiptNumber?: string; data?: unknown }) => void;
    onError?: (error: Error) => void;
}

export function usePaymentFlow<TFormData, TContext = unknown>(
    config: UsePaymentFlowConfig<TFormData, TContext>
) {
    const [state, dispatch] = useReducer(paymentReducer, { status: "idle" });
    const stateRef = useRef(state);
    stateRef.current = state;

    const configRef = useRef(config);
    configRef.current = config;

    // Requirement 5: 'verifying' state me page close/refresh pe beforeunload warning lagao
    useEffect(() => {
        if (state.status !== "verifying") return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "Payment is currently being verified. Leaving now may delay receipt or subscription confirmation.";
            return event.returnValue;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [state.status]);

    const startPayment = useCallback(async (formData: TFormData) => {
        // Requirement 4: Double-click se double order na bane (allowed only from idle or error)
        if (stateRef.current.status !== "idle" && stateRef.current.status !== "error") {
            console.warn("[usePaymentFlow] Payment already in progress:", stateRef.current.status);
            return;
        }

        dispatch({ type: "START" });

        try {
            const scriptLoaded = await loadRazorpayScript();
            const win = window as unknown as {
                Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
            };
            if (!scriptLoaded || !win.Razorpay) {
                throw new Error("Unable to load Razorpay payment gateway. Please check your connection.");
            }

            const { orderId, razorpayOptions, context } = await configRef.current.createOrder(formData);

            dispatch({ type: "ORDER_CREATED", orderId });

            const rzp = new win.Razorpay({
                ...razorpayOptions,
                handler: async (response: {
                    razorpay_payment_id: string;
                    razorpay_order_id?: string;
                    razorpay_signature?: string;
                }) => {
                    console.log("[usePaymentFlow] Payment authorized, verifying...", response);
                    dispatch({ type: "PAYMENT_AUTHORIZED", orderId });

                    try {
                        const verifyResult = await configRef.current.verifyPayment(response, context);
                        dispatch({
                            type: "VERIFIED",
                            paymentId: verifyResult.paymentId,
                            receiptNumber: verifyResult.receiptNumber,
                        });
                        configRef.current.onSuccess?.(verifyResult);
                    } catch (verifyErr) {
                        const message =
                            verifyErr instanceof Error ? verifyErr.message : "Payment verification failed.";
                        console.error("[usePaymentFlow] Verification error:", verifyErr);
                        dispatch({ type: "FAILED", message, retryable: false });
                        toast.error(message);
                        configRef.current.onError?.(
                            verifyErr instanceof Error ? verifyErr : new Error(message)
                        );
                    }
                },
                modal: {
                    ...((razorpayOptions.modal as Record<string, unknown>) || {}),
                    ondismiss: () => {
                        console.log("[usePaymentFlow] Razorpay modal dismissed");
                        // Requirement 3: 'verifying' me ondismiss ignore ho (payment already authorized hai)
                        if (stateRef.current.status === "modal_open") {
                            dispatch({ type: "MODAL_DISMISSED" });
                        }
                    },
                },
            });

            rzp.open();
        } catch (err) {
            console.error("[usePaymentFlow] Order creation error:", err);
            const message = err instanceof Error ? err.message : "Something went wrong.";
            dispatch({ type: "FAILED", message, retryable: true });
            toast.error(message);
            configRef.current.onError?.(err instanceof Error ? err : new Error(message));
        }
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

    // Requirement 4: Submit button disabled sirf tab jab status !== 'idle' aur !== 'error'
    const isSubmitting = state.status !== "idle" && state.status !== "error";

    return {
        state,
        dispatch,
        startPayment,
        reset,
        isSubmitting,
    };
}
