// Utilities for month/range handling used by server queries

// Helper to build a month key in UTC (YYYY-MM)
export const monthKeyUTC = (d: Date) => {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

// Generate an array of UTC-first-of-month dates from start to end (inclusive)
export const enumerateMonthsUTC = (start: Date, end: Date) => {
  const months: Date[] = [];
  const cur = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
  );
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cur <= last) {
    months.push(new Date(cur));
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return months;
};

// Parse a "YYYY-MM" string to year and month (1-12)
export const parseMonthParam = (value?: string) => {
  if (!value) return undefined;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return undefined;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return undefined;
  }
  return { year, month };
};

// Clamp a number to [min, max]
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
