import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

function createQueryBuilder(data: unknown = [], error: unknown = null) {
  const builder: Record<string, unknown> = {};
  const methods = [
    "select",
    "insert",
    "update",
    "upsert",
    "delete",
    "eq",
    "not",
    "gte",
    "lte",
    "gt",
    "lt",
    "in",
    "order",
    "limit",
    "filter",
  ];
  for (const m of methods) {
    builder[m] = vi.fn(() => builder);
  }
  builder.single = vi.fn(() => ({ data, error }));
  Object.defineProperty(builder, "then", {
    get() {
      return (resolve: (v: { data: unknown; error: unknown }) => void) => resolve({ data, error });
    },
  });
  return builder;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockFrom: any;

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}));

import { READ_TOOLS } from "../mcp-tools";

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom = vi.fn();
});

describe("get_training_history", () => {
  it("returns empty sessions when no data", async () => {
    mockFrom.mockReturnValue(createQueryBuilder([]));
    const result = await READ_TOOLS.get_training_history.handler({ days: 30 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      total_sessions: 0,
      period_days: 30,
      sessions: [],
    });
  });

  it("returns sessions with sets joined", async () => {
    const sessions = [
      {
        id: 1,
        date: "2026-04-10",
        name: "Push Day",
        programme: "GZCLP",
        block: null,
        week: 1,
        notes: null,
      },
    ];
    const sets = [
      {
        session_id: 1,
        exercise: "Bench Press",
        set_number: 1,
        reps: 8,
        weight: 185,
        weight_unit: "lbs",
        rpe: 7,
        duration_sec: null,
        notes: null,
      },
      {
        session_id: 1,
        exercise: "Bench Press",
        set_number: 2,
        reps: 8,
        weight: 185,
        weight_unit: "lbs",
        rpe: 8,
        duration_sec: null,
        notes: null,
      },
    ];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return createQueryBuilder(callCount === 1 ? sessions : sets);
    });

    const result = await READ_TOOLS.get_training_history.handler({ days: 14 });
    expect(result.success).toBe(true);
    const data = result.data as { total_sessions: number; sessions: { sets: unknown[] }[] };
    expect(data.total_sessions).toBe(1);
    expect(data.sessions[0].sets).toHaveLength(2);
  });
});

describe("get_body_comp_trends", () => {
  it("returns empty when no entries", async () => {
    mockFrom.mockReturnValue(createQueryBuilder([]));
    const result = await READ_TOOLS.get_body_comp_trends.handler({ days: 90 });
    expect(result.success).toBe(true);
    const data = result.data as { total_entries: number };
    expect(data.total_entries).toBe(0);
  });

  it("returns entries with correct structure", async () => {
    const entries = [
      {
        date: "2026-04-10",
        weight_lbs: 180,
        body_fat_pct: 15,
        lean_mass_lbs: 153,
        vo2_max: null,
        notes: null,
      },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(entries));
    const result = await READ_TOOLS.get_body_comp_trends.handler({});
    expect(result.success).toBe(true);
    const data = result.data as { entries: unknown[] };
    expect(data.entries).toHaveLength(1);
  });
});

describe("get_programme", () => {
  it("returns message when no programme exists", async () => {
    mockFrom.mockReturnValue(createQueryBuilder([]));
    const result = await READ_TOOLS.get_programme.handler({});
    expect(result.success).toBe(true);
    const data = result.data as { message: string };
    expect(data.message).toBe("No programme configured.");
  });

  it("returns programme with exercises", async () => {
    const days = [{ id: 1, programme: "GZCLP", day_number: 1, day_name: "Day 1", focus: "Push" }];
    const exercises = [
      {
        day_id: 1,
        exercise_order: 1,
        exercise: "Bench Press",
        sets: 4,
        reps: "3",
        target_rpe: 8,
        rest_seconds: 180,
        is_warmup: false,
        superset_group: null,
        notes: null,
      },
    ];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return createQueryBuilder(callCount === 1 ? days : exercises);
    });

    const result = await READ_TOOLS.get_programme.handler({});
    expect(result.success).toBe(true);
    const data = result.data as { programme_name: string; days: { exercises: unknown[] }[] };
    expect(data.programme_name).toBe("GZCLP");
    expect(data.days[0].exercises).toHaveLength(1);
  });
});

describe("get_working_weights", () => {
  it("returns working weights", async () => {
    const weights = [
      { exercise: "Bench Press", weight: 185, weight_unit: "lbs", date_set: "2026-04-08" },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(weights));
    const result = await READ_TOOLS.get_working_weights.handler({});
    expect(result.success).toBe(true);
    const data = result.data as { total_exercises: number };
    expect(data.total_exercises).toBe(1);
  });
});

describe("get_supplement_status", () => {
  it("returns supplement compliance for today", async () => {
    const supplements = [
      { id: 1, name: "Creatine", amount: 5, units: "g", time_of_day: "morning", active: true },
      { id: 2, name: "Vitamin D", amount: 5000, units: "IU", time_of_day: "morning", active: true },
    ];
    const log = [{ supplement_id: 1, taken: true, time_taken: "08:00" }];
    const stats = { totalActive: 2, dailyCompliance: [] };

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return createQueryBuilder(supplements);
      if (callCount === 2) return createQueryBuilder(log);
      if (callCount === 3) return createQueryBuilder([{ id: 1 }, { id: 2 }]);
      return createQueryBuilder([]);
    });

    const result = await READ_TOOLS.get_supplement_status.handler({});
    expect(result.success).toBe(true);
    const data = result.data as { taken_count: number; untaken_count: number };
    expect(data.taken_count).toBe(1);
    expect(data.untaken_count).toBe(1);
  });
});
