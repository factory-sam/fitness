import { describe, it, expect } from "vitest";
import {
  validateWorkoutInput,
  validateBodyCompInput,
  validateWorkingWeightInput,
} from "../validation";

describe("validateWorkoutInput", () => {
  it("passes with valid input", () => {
    const result = validateWorkoutInput({
      session: { date: "2026-04-10", name: "Push Day" },
      sets: [{ exercise: "Bench Press", set_number: 1, reps: 8, weight: 185 }],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when session is missing", () => {
    const result = validateWorkoutInput({ sets: [{ exercise: "BP", set_number: 1 }] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "session")).toBe(true);
  });

  it("fails when sets are empty", () => {
    const result = validateWorkoutInput({
      session: { date: "2026-04-10", name: "Push Day" },
      sets: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "sets")).toBe(true);
  });

  it("fails with invalid date format", () => {
    const result = validateWorkoutInput({
      session: { date: "April 10", name: "Push Day" },
      sets: [{ exercise: "BP", set_number: 1 }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "session.date")).toBe(true);
  });

  it("fails with RPE out of range", () => {
    const result = validateWorkoutInput({
      session: { date: "2026-04-10", name: "Push" },
      sets: [{ exercise: "BP", set_number: 1, rpe: 11 }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "sets[0].rpe")).toBe(true);
  });

  it("fails with negative weight", () => {
    const result = validateWorkoutInput({
      session: { date: "2026-04-10", name: "Push" },
      sets: [{ exercise: "BP", set_number: 1, weight: -10 }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "sets[0].weight")).toBe(true);
  });
});

describe("validateBodyCompInput", () => {
  it("passes with valid input", () => {
    const result = validateBodyCompInput({ date: "2026-04-10", weight_lbs: 180 });
    expect(result.valid).toBe(true);
  });

  it("fails when no measurements provided", () => {
    const result = validateBodyCompInput({ date: "2026-04-10" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "body_comp")).toBe(true);
  });

  it("fails with body fat > 100", () => {
    const result = validateBodyCompInput({ date: "2026-04-10", body_fat_pct: 110 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "body_fat_pct")).toBe(true);
  });

  it("fails with invalid date", () => {
    const result = validateBodyCompInput({ date: "bad-date", weight_lbs: 180 });
    expect(result.valid).toBe(false);
  });
});

describe("validateWorkingWeightInput", () => {
  it("passes with valid input", () => {
    const result = validateWorkingWeightInput({ exercise: "Bench Press", weight: 190 });
    expect(result.valid).toBe(true);
  });

  it("fails with missing exercise", () => {
    const result = validateWorkingWeightInput({ weight: 190 });
    expect(result.valid).toBe(false);
  });

  it("fails with zero weight", () => {
    const result = validateWorkingWeightInput({ exercise: "Bench Press", weight: 0 });
    expect(result.valid).toBe(false);
  });

  it("fails with invalid weight unit", () => {
    const result = validateWorkingWeightInput({
      exercise: "Bench Press",
      weight: 190,
      weight_unit: "stones",
    });
    expect(result.valid).toBe(false);
  });

  it("passes with explicit weight unit", () => {
    const result = validateWorkingWeightInput({
      exercise: "Bench Press",
      weight: 85,
      weight_unit: "kg",
    });
    expect(result.valid).toBe(true);
  });
});
