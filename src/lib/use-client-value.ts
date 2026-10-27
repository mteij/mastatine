import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * Returns `getClient()` in the browser and `serverValue` during SSR/hydration,
 * so client-only values (time of day, localStorage, "mounted") never mismatch.
 */
export function useClientValue<T extends string | number | boolean>(getClient: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeNever, getClient, () => serverValue);
}
