import {
  getSessionsWithSets,
  getBodyCompEntries,
  getProgrammeWithExercises,
  getAllWorkingWeights,
  getActiveSupplements,
  getSupplementLogForDate,
  getSupplementComplianceStats,
} from "../queries";
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

// Write tools will be added in #17
export const WRITE_TOOLS: Record<string, ToolDefinition> = {};

export function getAllTools(): Record<string, ToolDefinition> {
  return { ...READ_TOOLS, ...WRITE_TOOLS };
}

export type { ToolDefinition, ToolResult };
