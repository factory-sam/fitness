interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateWorkoutInput(params: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const session = params.session as Record<string, unknown> | undefined;
  const sets = params.sets as Record<string, unknown>[] | undefined;

  if (!session) {
    errors.push({ field: "session", message: "Session object is required" });
  } else {
    if (!session.date || typeof session.date !== "string") {
      errors.push({ field: "session.date", message: "Date is required (YYYY-MM-DD)" });
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(session.date as string)) {
      errors.push({ field: "session.date", message: "Date must be in YYYY-MM-DD format" });
    }
    if (!session.name || typeof session.name !== "string") {
      errors.push({ field: "session.name", message: "Session name is required" });
    }
  }

  if (!sets || !Array.isArray(sets) || sets.length === 0) {
    errors.push({ field: "sets", message: "At least one set is required" });
  } else {
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      if (!set.exercise || typeof set.exercise !== "string") {
        errors.push({ field: `sets[${i}].exercise`, message: "Exercise name is required" });
      }
      if (typeof set.set_number !== "number" || set.set_number < 1) {
        errors.push({ field: `sets[${i}].set_number`, message: "Set number must be >= 1" });
      }
      if (set.reps != null && (typeof set.reps !== "number" || set.reps < 0)) {
        errors.push({ field: `sets[${i}].reps`, message: "Reps must be >= 0" });
      }
      if (set.weight != null && (typeof set.weight !== "number" || set.weight < 0)) {
        errors.push({ field: `sets[${i}].weight`, message: "Weight must be >= 0" });
      }
      if (set.rpe != null && (typeof set.rpe !== "number" || set.rpe < 1 || set.rpe > 10)) {
        errors.push({ field: `sets[${i}].rpe`, message: "RPE must be between 1 and 10" });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateBodyCompInput(params: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!params.date || typeof params.date !== "string") {
    errors.push({ field: "date", message: "Date is required (YYYY-MM-DD)" });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date as string)) {
    errors.push({ field: "date", message: "Date must be in YYYY-MM-DD format" });
  }

  const numericFields = ["weight_lbs", "body_fat_pct", "lean_mass_lbs", "vo2_max"];
  let hasAtLeastOne = false;
  for (const field of numericFields) {
    if (params[field] != null) {
      hasAtLeastOne = true;
      if (typeof params[field] !== "number" || (params[field] as number) < 0) {
        errors.push({ field, message: `${field} must be a positive number` });
      }
    }
  }

  if (!hasAtLeastOne) {
    errors.push({
      field: "body_comp",
      message:
        "At least one measurement is required (weight_lbs, body_fat_pct, lean_mass_lbs, or vo2_max)",
    });
  }

  if (params.body_fat_pct != null && (params.body_fat_pct as number) > 100) {
    errors.push({ field: "body_fat_pct", message: "Body fat percentage must be <= 100" });
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorkingWeightInput(params: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!params.exercise || typeof params.exercise !== "string") {
    errors.push({ field: "exercise", message: "Exercise name is required" });
  }
  if (typeof params.weight !== "number" || params.weight <= 0) {
    errors.push({ field: "weight", message: "Weight must be a positive number" });
  }
  if (params.weight_unit != null && !["lbs", "kg"].includes(params.weight_unit as string)) {
    errors.push({ field: "weight_unit", message: 'Weight unit must be "lbs" or "kg"' });
  }

  return { valid: errors.length === 0, errors };
}
