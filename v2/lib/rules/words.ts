export const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

const ONES = [
  "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
  "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN",
];
const TENS = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

const two = (x: number) => (x < 20 ? ONES[x] : TENS[Math.floor(x / 10)] + (x % 10 ? " " + ONES[x % 10] : ""));
const three = (x: number) =>
  (x >= 100 ? ONES[Math.floor(x / 100)] + " HUNDRED" + (x % 100 ? " " : "") : "") + (x % 100 ? two(x % 100) : "");

/** 584 → "FIVE HUNDRED EIGHTY FOUR" (same style as v1's number-to-words output). */
export function totalToWords(n: number): string {
  n = Math.round(n);
  if (n <= 0) return "";
  if (n >= 1000) return three(Math.floor(n / 1000)) + " THOUSAND" + (n % 1000 ? " " + three(n % 1000) : "");
  return three(n);
}

const ORDINALS = [
  "", "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH", "TENTH",
  "ELEVENTH", "TWELFTH", "THIRTEENTH", "FOURTEENTH", "FIFTEENTH", "SIXTEENTH", "SEVENTEENTH",
  "EIGHTEENTH", "NINETEENTH", "TWENTIETH",
];

const dayWord = (d: number) =>
  d <= 20 ? ORDINALS[d] : d < 30 ? "TWENTY " + ORDINALS[d - 20] : d === 30 ? "THIRTIETH" : "THIRTY " + ORDINALS[d - 30];

/** "2013-10-19" → "NINETEENTH OCTOBER TWO THOUSAND THIRTEEN" (printed on Nursery–8 sheets). */
export function dobWords(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${dayWord(d)} ${MONTHS[m - 1]} ${totalToWords(y)}`;
}

/** "2026-04-05" → "05-04-2026". */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}
