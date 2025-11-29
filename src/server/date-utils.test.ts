import { describe, expect, test } from "bun:test";

import {
  clamp,
  enumerateMonthsUTC,
  monthKeyUTC,
  parseMonthParam,
} from "./date-utils";

describe("enumerateMonthsUTC", () => {
  test("returns inclusive UTC-first-of-month dates across timezones", () => {
    const start = new Date("2024-01-15T18:30:00-08:00");
    const end = new Date("2024-03-05T04:00:00Z");

    const months = enumerateMonthsUTC(start, end);

    expect(months.map(monthKeyUTC)).toEqual(["2024-01", "2024-02", "2024-03"]);
    months.forEach((d) => {
      expect(d.getUTCDate()).toBe(1);
      expect(d.getUTCHours()).toBe(0);
      expect(d.getUTCMinutes()).toBe(0);
    });
  });

  test("returns an empty list when start is after end", () => {
    const months = enumerateMonthsUTC(
      new Date("2024-04-01T00:00:00Z"),
      new Date("2024-03-01T00:00:00Z"),
    );
    expect(months).toHaveLength(0);
  });
});

describe("monthKeyUTC", () => {
  test("formats UTC month boundaries with leading zeros", () => {
    const key = monthKeyUTC(new Date("2024-02-29T23:59:59-08:00"));
    expect(key).toBe("2024-03");
  });
});

describe("parseMonthParam", () => {
  test("returns objects for well-formed YYYY-MM strings", () => {
    expect(parseMonthParam("2024-12")).toEqual({ year: 2024, month: 12 });
  });

  test("rejects empty or malformed values", () => {
    expect(parseMonthParam(undefined)).toBeUndefined();
    expect(parseMonthParam("2024-13")).toBeUndefined();
    expect(parseMonthParam("24-01")).toBeUndefined();
  });
});

describe("clamp", () => {
  test("limits numbers to the provided range", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-1, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });
});
