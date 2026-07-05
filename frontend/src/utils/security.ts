/**
 * Security utilities for data scrubbing and prompt injection defense.
 */

// Patterns to detect potential prompt injection or jailbreak attempts.
const INJECTION_PATTERNS = [
  /ignore\s+(?:previous|all|system|above|prior)?\s*instructions/i,
  /bypass\s+(?:rules|guidelines|verification|security|approval|safeguards)/i,
  /force\s+(?:auto-?)?approval/i,
  /auto-?approve/i,
  /system\s+override/i,
  /override\s+system/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /you\s+must\s+approve/i,
  /bypass\s+the\s+rules/i,
  /ignore\s+the\s+above/i,
  /ignore\s+everything/i,
  /disregard\s+all\s+instructions/i,
  /disregard\s+previous\s+instructions/i,
];

/**
 * Scrubs Social Security Numbers (SSNs) and credit card numbers from a text string.
 *
 * @param text The input text to be scrubbed.
 * @returns An object containing the scrubbed text and an array of redacted categories.
 */
export function scrubPersonalData(text: string): { scrubbedText: string; redactedCategories: string[] } {
  let scrubbedText = text;
  const redactedCategories: string[] = [];

  // 1. Credit Cards (13 to 19 digits, possibly separated by spaces or hyphens)
  const ccCandidateRegex = /\b(?:\d[- ]*?){13,19}\b/g;
  let hasCC = false;

  scrubbedText = scrubbedText.replace(ccCandidateRegex, (match) => {
    const digitsOnly = match.replace(/[- ]/g, "");
    if (digitsOnly.length >= 13 && digitsOnly.length <= 19) {
      hasCC = true;
      return "[REDACTED_CC]";
    }
    return match;
  });

  if (hasCC) {
    redactedCategories.push("Credit Card");
  }

  // 2. SSNs (Exactly 9 digits, e.g. XXX-XX-XXXX, XXX XX XXXX, or XXXXXXXXX)
  const ssnCandidateRegex = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g;
  let hasSSN = false;

  scrubbedText = scrubbedText.replace(ssnCandidateRegex, (match) => {
    const digitsOnly = match.replace(/[- ]/g, "");
    if (digitsOnly.length === 9) {
      hasSSN = true;
      return "[REDACTED_SSN]";
    }
    return match;
  });

  if (hasSSN) {
    redactedCategories.push("SSN");
  }

  return { scrubbedText, redactedCategories };
}

/**
 * Checks if the input text contains typical prompt injection phrases or override instructions.
 *
 * @param text The input text to scan.
 * @returns True if a prompt injection pattern is detected, false otherwise.
 */
export function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}
