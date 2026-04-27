// Format helpers — pure functions reused across the UI.
//
// Ports the loose helpers from `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx`
// lines 273–281 into a typed module. Three exports:
//
//   - fmtBytes(n):    human-readable byte count   (B / KB / MB / GB)
//   - fmtDate(d):     locale-stable YYYY-MM-DD    (ISO calendar date)
//   - fmtDateRel(d):  relative phrase             ("just now", "5d ago", ...)
//
// Design notes:
//   * fmtBytes uses 1024-based units (KiB convention) but renders the
//     short-form labels everyone reads as "KB / MB / GB". That matches
//     Andrew's reference and what the file-explorer UI in the design
//     drop displays.
//   * Negative inputs are not part of the design contract. We return
//     the raw value formatted as bytes (e.g. "-1 B") rather than throw —
//     this keeps the helper safe to call without try/catch in render
//     paths, but callers should not rely on the exact shape.
//   * fmtDate returns ISO-8601 calendar form (YYYY-MM-DD) computed from
//     the *UTC* parts of the input. Picking UTC keeps tests deterministic
//     across CI/local timezones; a future locale-aware date helper can
//     wrap toLocaleDateString without disturbing this contract.
//   * fmtDateRel rounds to the nearest unit (no future-tense handling for
//     MVP — the design only shows "ago" labels).

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

/**
 * Format a byte count using 1024-based units. Returns one decimal place
 * when the value is not an exact unit, and a whole number when it is.
 *
 * Examples:
 *   fmtBytes(0)          -> "0 B"
 *   fmtBytes(500)        -> "500 B"
 *   fmtBytes(1024)       -> "1 KB"
 *   fmtBytes(1536)       -> "1.5 KB"
 *   fmtBytes(1048576)    -> "1 MB"
 *   fmtBytes(1073741824) -> "1 GB"
 */
export function fmtBytes(n: number): string {
  if (!Number.isFinite(n)) return `${n} B`;

  // Bytes — no scaling.
  if (Math.abs(n) < KB) {
    return `${n} B`;
  }

  // Pick the largest unit where the value is >= 1.
  let scaled: number;
  let unit: 'KB' | 'MB' | 'GB';
  if (Math.abs(n) < MB) {
    scaled = n / KB;
    unit = 'KB';
  } else if (Math.abs(n) < GB) {
    scaled = n / MB;
    unit = 'MB';
  } else {
    scaled = n / GB;
    unit = 'GB';
  }

  // Show one decimal only when the value isn't an exact unit boundary.
  const rounded = Math.round(scaled * 10) / 10;
  const text = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
  return `${text} ${unit}`;
}

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

/**
 * Format a date as an ISO calendar date (YYYY-MM-DD) using UTC parts.
 * Picking UTC keeps the output stable across timezones (tests rely on
 * this).
 */
export function fmtDate(d: Date | string): string {
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';

  const yyyy = date.getUTCFullYear().toString().padStart(4, '0');
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = date.getUTCDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH_28 = 28 * DAY;
const YEAR = 365 * DAY;

/**
 * Render a "time ago" string relative to `Date.now()`. Rounds to the
 * nearest unit. Future-tense and i18n are out of scope for MVP.
 *
 *   < 60s     -> "just now"
 *   < 1h      -> "<n>m ago"
 *   < 24h     -> "<n>h ago"
 *   < 7d      -> "<n>d ago"
 *   < 28d     -> "<n>w ago"
 *   < 365d    -> "<n>mo ago"
 *   else      -> "<n>y ago"
 */
export function fmtDateRel(d: Date | string): string {
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';

  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);

  if (abs < MIN) return 'just now';
  if (abs < HOUR) return `${Math.round(abs / MIN)}m ago`;
  if (abs < DAY) return `${Math.round(abs / HOUR)}h ago`;
  if (abs < WEEK) return `${Math.round(abs / DAY)}d ago`;
  if (abs < MONTH_28) return `${Math.round(abs / WEEK)}w ago`;
  if (abs < YEAR) return `${Math.round(abs / (30 * DAY))}mo ago`;
  return `${Math.round(abs / YEAR)}y ago`;
}
