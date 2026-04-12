export interface AISessionRecord {
  id: number;
  user_id: string;
  droid_session_id: string;
  title: string | null;
  created_at: string;
  last_active_at: string;
}

export interface AIInsight {
  type: "volume_trend" | "plateau_alert" | "body_comp" | "compliance";
  title: string;
  content: string;
  severity?: "info" | "warning" | "success";
}

export interface AIInsightRecord extends AIInsight {
  id: number;
  user_id: string;
  context_hash: string | null;
  created_at: string;
  expires_at: string;
}

export interface ParsedSet {
  exercise: string;
  set_number: number;
  reps: number;
  weight: number;
  weight_unit: string;
  rpe?: number;
  notes?: string;
}

export interface ParsedWorkout {
  session: {
    date: string;
    name: string;
    programme?: string;
    block?: string;
    week?: number;
  };
  sets: ParsedSet[];
  confidence: number;
  ambiguities?: { field: string; options: string[] }[];
}

export interface SessionPlan {
  day_name: string;
  programme: string;
  exercises: {
    exercise: string;
    sets: number;
    reps: string;
    target_weight: number;
    weight_unit: string;
    target_rpe?: number;
    is_warmup: boolean;
    superset_group?: string;
    notes?: string;
  }[];
}
