/** Display names are what other people see instead of an email address, so everyone needs a proper one. */
export const NAME_MIN = 2;
export const NAME_MAX = 60;

/** A usable display name: long enough, and not an email address (which would defeat the point). */
export function hasDisplayName(name: string | null | undefined): boolean {
  const trimmed = (name ?? "").trim();
  return trimmed.length >= NAME_MIN && !trimmed.includes("@");
}

export function validateDisplayName(input: string): { name: string } | { error: string } {
  const name = input.replace(/\s+/g, " ").trim();
  if (name.length < NAME_MIN) return { error: `Use at least ${NAME_MIN} characters.` };
  if (name.length > NAME_MAX) return { error: `Keep it under ${NAME_MAX} characters.` };
  if (name.includes("@")) return { error: "Please do not use an email address. Other members will see this name." };
  return { name };
}
