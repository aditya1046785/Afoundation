import { PaymentStatus, AutopayStatus } from "@prisma/client";

export type TransitionMap<T extends string> = Record<T, readonly T[]>;

export const PAYMENT_STATUS_TRANSITIONS: TransitionMap<PaymentStatus> = {
    PENDING: ["COMPLETED", "FAILED"],
    COMPLETED: ["REFUNDED"],
    FAILED: [],
    REFUNDED: [],
};

export const AUTOPAY_STATUS_TRANSITIONS: TransitionMap<AutopayStatus> = {
    ACTIVE: ["PAUSED", "CANCELLED"],
    PAUSED: ["ACTIVE", "CANCELLED"],
    CANCELLED: [],
};

/**
 * Checks whether a state transition from `from` to `to` is allowed.
 */
export function canTransition<T extends string>(
    map: TransitionMap<T>,
    from: T,
    to: T
): boolean {
    return map[from]?.includes(to) ?? false;
}

/**
 * Returns the list of `from` states from which transitioning to target `to` is allowed.
 * E.g., for target "COMPLETED" in PAYMENT_STATUS_TRANSITIONS, returns ["PENDING"].
 * E.g., for target "ACTIVE" in AUTOPAY_STATUS_TRANSITIONS, returns ["PAUSED"].
 */
export function getAllowedFromStates<T extends string>(
    map: TransitionMap<T>,
    to: T
): T[] {
    return (Object.keys(map) as T[]).filter((from) => map[from]?.includes(to));
}

export const getValidFromStates = getAllowedFromStates;
