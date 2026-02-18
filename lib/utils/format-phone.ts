/**
 * Format a phone number string to +1 (XXX) XXX-XXXX format.
 * Accepts various input formats: 9516940400, (951)694-0400, 951-694-0400, etc.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Handle 10-digit US numbers
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // Handle 11-digit US numbers starting with 1
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  // Return original if not a standard US number
  return phone;
}

/**
 * Format phone for display in seed data: (XXX) XXX-XXXX
 */
export function formatPhoneLocal(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
