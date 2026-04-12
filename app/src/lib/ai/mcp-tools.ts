import {
  getSessionsWithSets,
  getBodyCompEntries,
  getProgrammeWithExercises,
  getAllWorkingWeights,
  getActiveSupplements,
  getSupplementLogForDate,
  getSupplementComplianceStats,
  createSession,
  createSet,
  createBodyComp,
  upsertWorkingWeight,
} from "../queries";
import {
  validateWorkoutInput,
  validateBodyCompInput,
  validateWorkingWeightInput,
} from "./validation";
import { getLocalDateString } from "../date";

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface ToolDefinition {
  description: string;
  parameters: Record<string, { type: string; description: string; default?: unknown }>;
  handler: (params: Record<string, unknown>) => Promise<ToolResult>;
}

// --- Read Tools ---

const getTrainingHistory: ToolDefinition = {
  description:
    "Get recent workout sessions with all sets, including exercises, weights, reps, and RPE.",
  parameters: {
    days: {
      type: "number",
      description: "Number of days of history to retrieve (default: 30)",
      default: 30,
    },
  },
  handler: async (params) => {
    const days = (params.days as number) ?? 30;
    const sessions = await getSessionsWithSets(days);
    const summary = {
      total_sessions: sessions.length,
      period_days: days,
      sessions: sessions.map((s) => ({
        date: s.date,
        name: s.name,
        programme: s.programme,
        block: s.block,
        week: s.week,
        total_sets: s.sets.length,
        exercises: [...new Set(s.sets.map((set: { exercise: string }) => set.exercise))],
        sets: s.sets,
      })),
    };
    return { success: true, data: summary };
  },
};

const getBodyCompTrends: ToolDefinition = {
  description:
    "Get body composition entries over time including weight, body fat percentage, and lean mass.",
  parameters: {
    days: {
      type: "number",
      description: "Number of days of history to retrieve (default: 90)",
      default: 90,
    },
  },
  handler: async (params) => {
    const days = (params.days as number) ?? 90;
    const entries = await getBodyCompEntries(days);
    return {
      success: true,
      data: {
        total_entries: entries.length,
        period_days: days,
        entries,
      },
    };
  },
};

const getProgramme: ToolDefinition = {
  description:
    "Get the current training programme structure with all days and their exercises, sets, reps, and target RPE.",
  parameters: {},
  handler: async () => {
    const programme = await getProgrammeWithExercises();
    if (programme.length === 0) {
      return {
        success: true,
        data: { message: "No programme configured.", days: [] },
      };
    }
    return {
      success: true,
      data: {
        programme_name: programme[0].programme,
        total_days: programme.length,
        days: programme.map((d) => ({
          day_number: d.day_number,
          day_name: d.day_name,
          focus: d.focus,
          exercises: d.exercises,
        })),
      },
    };
  },
};

const getWorkingWeights: ToolDefinition = {
  description:
    "Get the current working weights for all exercises. These are the most recent recorded weights per exercise.",
  parameters: {},
  handler: async () => {
    const weights = await getAllWorkingWeights();
    return {
      success: true,
      data: {
        total_exercises: weights.length,
        weights: weights.map((w) => ({
          exercise: w.exercise,
          weight: w.weight,
          weight_unit: w.weight_unit,
          date_set: w.date_set,
        })),
      },
    };
  },
};

const getSupplementStatus: ToolDefinition = {
  description:
    "Get supplement compliance status for a given date, including which supplements are taken and untaken.",
  parameters: {
    date: {
      type: "string",
      description: "Date in YYYY-MM-DD format (default: today)",
    },
  },
  handler: async (params) => {
    const date = (params.date as string) ?? getLocalDateString();
    const [supplements, log, stats] = await Promise.all([
      getActiveSupplements(),
      getSupplementLogForDate(date),
      getSupplementComplianceStats(7),
    ]);

    const takenIds = new Set(
      (log ?? [])
        .filter((l: { taken: boolean | number }) => l.taken === true || l.taken === 1)
        .map((l: { supplement_id: number }) => l.supplement_id),
    );

    const supplementStatus = supplements.map(
      (s: {
        id: number;
        name: string;
        amount: number | null;
        units: string | null;
        time_of_day: string;
      }) => ({
        name: s.name,
        amount: s.amount,
        units: s.units,
        time_of_day: s.time_of_day,
        taken: takenIds.has(s.id),
      }),
    );

    return {
      success: true,
      data: {
        date,
        total_active: supplements.length,
        taken_count: takenIds.size,
        untaken_count: supplements.length - takenIds.size,
        supplements: supplementStatus,
        weekly_compliance: stats.dailyCompliance,
      },
    };
  },
};

export const READ_TOOLS: Record<string, ToolDefinition> = {
  get_training_history: getTrainingHistory,
  get_body_comp_trends: getBodyCompTrends,
  get_programme: getProgramme,
  get_working_weights: getWorkingWeights,
  get_supplement_status: getSupplementStatus,
};

// --- Write Tools ---

const logWorkout: ToolDefinition = {
  description:
    "Create a workout session with sets. Validates all input before writing. Returns the created session ID and set count.",
  parameters: {
    session: {
      type: "object",
      description:
        "Session details: { date: 'YYYY-MM-DD', name: string, programme?: string, block?: string, week?: number, notes?: string }",
    },
    sets: {
      type: "array",
      description:
        "Array of sets: [{ exercise, set_number, reps, weight, weight_unit?, rpe?, duration_sec?, notes? }]",
    },
  },
  handler: async (params) => {
    const validation = validateWorkoutInput(params);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ")}`,
      };
    }

    const session = params.session as Record<string, unknown>;
    const sets = params.sets as Record<string, unknown>[];

    try {
      const sessionId = await createSession({
        date: session.date as string,
        name: session.name as string,
        programme: session.programme as string | undefined,
        block: session.block as string | undefined,
        week: session.week as number | undefined,
        notes: session.notes as string | undefined,
      });

      for (const set of sets) {
        await createSet({
          session_id: sessionId,
          exercise: set.exercise as string,
          set_number: set.set_number as number,
          reps: set.reps as number | undefined,
          weight: set.weight as number | undefined,
          weight_unit: (set.weight_unit as string) ?? "lbs",
          rpe: set.rpe as number | undefined,
          duration_sec: set.duration_sec as number | undefined,
          notes: set.notes as string | undefined,
        });
      }

      return {
        success: true,
        data: { session_id: sessionId, set_count: sets.length },
      };
    } catch (err) {
      return {
        success: false,
        error: `Failed to create workout: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};

const logBodyComp: ToolDefinition = {
  description:
    "Record a body composition entry. At least one measurement (weight, body fat, lean mass, or VO2 max) is required.",
  parameters: {
    date: { type: "string", description: "Date in YYYY-MM-DD format" },
    weight_lbs: { type: "number", description: "Body weight in pounds" },
    body_fat_pct: { type: "number", description: "Body fat percentage" },
    lean_mass_lbs: { type: "number", description: "Lean mass in pounds" },
    vo2_max: { type: "number", description: "VO2 max value" },
    notes: { type: "string", description: "Optional notes" },
  },
  handler: async (params) => {
    const validation = validateBodyCompInput(params);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ")}`,
      };
    }

    try {
      await createBodyComp({
        date: params.date as string,
        weight_lbs: params.weight_lbs as number | undefined,
        body_fat_pct: params.body_fat_pct as number | undefined,
        lean_mass_lbs: params.lean_mass_lbs as number | undefined,
        vo2_max: params.vo2_max as number | undefined,
        notes: params.notes as string | undefined,
      });

      return { success: true, data: { date: params.date, recorded: true } };
    } catch (err) {
      return {
        success: false,
        error: `Failed to log body comp: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};

const updateWorkingWeight: ToolDefinition = {
  description: "Update the working weight for an exercise. Creates a new entry with today's date.",
  parameters: {
    exercise: { type: "string", description: "Exercise name (must match existing exercise names)" },
    weight: { type: "number", description: "New working weight" },
    weight_unit: { type: "string", description: 'Weight unit: "lbs" or "kg" (default: "lbs")' },
  },
  handler: async (params) => {
    const validation = validateWorkingWeightInput(params);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ")}`,
      };
    }

    try {
      await upsertWorkingWeight({
        exercise: params.exercise as string,
        weight: params.weight as number,
        weight_unit: params.weight_unit as string | undefined,
      });

      return {
        success: true,
        data: {
          exercise: params.exercise,
          weight: params.weight,
          weight_unit: params.weight_unit ?? "lbs",
          updated: true,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: `Failed to update working weight: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};

export const WRITE_TOOLS: Record<string, ToolDefinition> = {
  log_workout: logWorkout,
  log_body_comp: logBodyComp,
  update_working_weight: updateWorkingWeight,
};

export function getAllTools(): Record<string, ToolDefinition> {
  return { ...READ_TOOLS, ...WRITE_TOOLS };
}

export type { ToolDefinition, ToolResult };
