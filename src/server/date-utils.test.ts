import { describe, expect, test } from "bun:test";

import { enumerateMonthsUTC, monthKeyUTC } from "./date-utils";

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
