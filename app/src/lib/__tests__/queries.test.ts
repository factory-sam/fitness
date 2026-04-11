import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers before importing queries
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Build a chainable Supabase mock
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
    "order",
    "limit",
  ];
  for (const m of methods) {
    builder[m] = vi.fn(() => builder);
  }
  builder.single = vi.fn(() => ({ data, error }));
  // Default terminal: return array
  builder.then = undefined;
  // Make it thenable for awaited chains that don't call .single()
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

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom = vi.fn();
});

describe("getRecentSessions", () => {
  it("returns sessions ordered by date descending", async () => {
    const sessions = [
      { id: 2, date: "2025-04-10", name: "Upper A" },
      { id: 1, date: "2025-04-08", name: "Lower A" },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(sessions));

    const { getRecentSessions } = await import("@/lib/queries");
    const result = await getRecentSessions(10);

    expect(mockFrom).toHaveBeenCalledWith("sessions");
    expect(result).toEqual(sessions);
  });

  it("returns empty array when data is null", async () => {
    mockFrom.mockReturnValue(createQueryBuilder(null));

    const { getRecentSessions } = await import("@/lib/queries");
    const result = await getRecentSessions();
    expect(result).toEqual([]);
  });
});

describe("getSession", () => {
  it("returns session with sets", async () => {
    const session = { id: 1, date: "2025-04-10", name: "Upper A" };
    const sets = [{ id: 1, session_id: 1, exercise: "Bench Press", set_number: 1 }];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return createQueryBuilder(session);
      return createQueryBuilder(sets);
    });

    const { getSession } = await import("@/lib/queries");
    const result = await getSession(1);

    expect(result).toEqual({ ...session, sets });
  });

  it("returns null when session not found", async () => {
    mockFrom.mockReturnValue(createQueryBuilder(null));

    const { getSession } = await import("@/lib/queries");
    const result = await getSession(999);
    expect(result).toBeNull();
  });
});

describe("createSession", () => {
  it("returns the new session id", async () => {
    const builder = createQueryBuilder({ id: 42 });
    mockFrom.mockReturnValue(builder);

    const { createSession } = await import("@/lib/queries");
    const id = await createSession({ date: "2025-04-10", name: "Upper A" });
    expect(id).toBe(42);
  });

  it("throws on supabase error", async () => {
    const builder = createQueryBuilder(null, { message: "insert failed" });
    mockFrom.mockReturnValue(builder);

    const { createSession } = await import("@/lib/queries");
    await expect(createSession({ date: "2025-04-10", name: "Upper A" })).rejects.toEqual({
      message: "insert failed",
    });
  });
});

describe("getAllWorkingWeights", () => {
  it("deduplicates by exercise keeping latest entry", async () => {
    const rows = [
      { exercise: "Bench Press", weight: 185, weight_unit: "lbs", date_set: "2025-04-10" },
      { exercise: "Bench Press", weight: 180, weight_unit: "lbs", date_set: "2025-04-05" },
      { exercise: "Squat", weight: 225, weight_unit: "lbs", date_set: "2025-04-09" },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(rows));

    const { getAllWorkingWeights } = await import("@/lib/queries");
    const result = await getAllWorkingWeights();

    expect(result).toHaveLength(2);
    expect(result[0].exercise).toBe("Bench Press");
    expect(result[0].weight).toBe(185);
    expect(result[1].exercise).toBe("Squat");
  });

  it("returns empty array when data is null", async () => {
    mockFrom.mockReturnValue(createQueryBuilder(null));

    const { getAllWorkingWeights } = await import("@/lib/queries");
    const result = await getAllWorkingWeights();
    expect(result).toEqual([]);
  });
});

describe("getPersonalRecords", () => {
  it("groups by exercise and keeps max weight", async () => {
    const rows = [
      {
        exercise: "Bench Press",
        weight: 200,
        weight_unit: "lbs",
        sessions: { date: "2025-04-10" },
      },
      {
        exercise: "Bench Press",
        weight: 185,
        weight_unit: "lbs",
        sessions: { date: "2025-04-05" },
      },
      { exercise: "Squat", weight: 315, weight_unit: "lbs", sessions: { date: "2025-04-08" } },
      { exercise: "Squat", weight: 300, weight_unit: "lbs", sessions: { date: "2025-04-01" } },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(rows));

    const { getPersonalRecords } = await import("@/lib/queries");
    const result = await getPersonalRecords();

    expect(result).toHaveLength(2);
    const bench = result.find((r) => r.exercise === "Bench Press");
    expect(bench?.max_weight).toBe(200);
    const squat = result.find((r) => r.exercise === "Squat");
    expect(squat?.max_weight).toBe(315);
  });

  it("returns sorted by exercise name", async () => {
    const rows = [
      { exercise: "Squat", weight: 315, weight_unit: "lbs", sessions: { date: "2025-04-08" } },
      {
        exercise: "Bench Press",
        weight: 200,
        weight_unit: "lbs",
        sessions: { date: "2025-04-10" },
      },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(rows));

    const { getPersonalRecords } = await import("@/lib/queries");
    const result = await getPersonalRecords();

    expect(result[0].exercise).toBe("Bench Press");
    expect(result[1].exercise).toBe("Squat");
  });
});

describe("getExerciseHistory", () => {
  it("flattens session join data", async () => {
    const rows = [
      {
        set_number: 1,
        reps: 8,
        weight: 185,
        weight_unit: "lbs",
        rpe: 7,
        duration_sec: null,
        notes: null,
        sessions: { date: "2025-04-10", name: "Upper A" },
      },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(rows));

    const { getExerciseHistory } = await import("@/lib/queries");
    const result = await getExerciseHistory("Bench Press");

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2025-04-10");
    expect(result[0].session_name).toBe("Upper A");
    expect(result[0].weight).toBe(185);
  });
});

describe("getBodyCompHistory", () => {
  it("returns body comp entries", async () => {
    const entries = [{ id: 1, date: "2025-04-10", weight_lbs: 180, body_fat_pct: 15 }];
    mockFrom.mockReturnValue(createQueryBuilder(entries));

    const { getBodyCompHistory } = await import("@/lib/queries");
    const result = await getBodyCompHistory();
    expect(result).toEqual(entries);
  });
});

describe("createBodyComp", () => {
  it("throws on error", async () => {
    // createBodyComp uses insert without .single(), so we need the thenable to return error
    const insertMock = vi.fn(() => ({
      then: (resolve: (v: { data: unknown; error: unknown }) => void) =>
        resolve({ data: null, error: { message: "bad request" } }),
    }));
    mockFrom.mockReturnValue({ insert: insertMock });

    const { createBodyComp } = await import("@/lib/queries");
    await expect(createBodyComp({ date: "2025-04-10", weight_lbs: 180 })).rejects.toEqual({
      message: "bad request",
    });
  });
});

describe("getActiveSupplements", () => {
  it("returns only active supplements", async () => {
    const supps = [
      { id: 1, name: "Creatine", active: true, time_of_day: "morning" },
      { id: 2, name: "Vitamin D", active: true, time_of_day: "morning" },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(supps));

    const { getActiveSupplements } = await import("@/lib/queries");
    const result = await getActiveSupplements();
    expect(result).toEqual(supps);
  });
});

describe("getProgrammeDays", () => {
  it("returns programme days in order", async () => {
    const days = [
      { id: 1, day_number: 1, name: "Upper A" },
      { id: 2, day_number: 2, name: "Lower A" },
    ];
    mockFrom.mockReturnValue(createQueryBuilder(days));

    const { getProgrammeDays } = await import("@/lib/queries");
    const result = await getProgrammeDays();
    expect(result).toEqual(days);
  });
});
