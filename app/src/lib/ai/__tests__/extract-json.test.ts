import { describe, it, expect } from "vitest";
import { extractJSON } from "../extract-json";

describe("extractJSON", () => {
  it("parses plain JSON string", () => {
    const input = '{"session":{"date":"2026-04-12","name":"Push"},"sets":[],"confidence":0.9}';
    const result = extractJSON(input);
    expect(result).toEqual({
      session: { date: "2026-04-12", name: "Push" },
      sets: [],
      confidence: 0.9,
    });
  });

  it("extracts JSON from fenced code block", () => {
    const input =
      'Here is the parsed workout:\n```json\n{"session":{"date":"2026-04-12","name":"Pull"},"sets":[{"exercise":"Barbell Row","set_number":1,"reps":8,"weight":135,"weight_unit":"lbs"}],"confidence":0.95}\n```';
    const result = extractJSON<{ session: { name: string }; confidence: number }>(input);
    expect(result?.session.name).toBe("Pull");
    expect(result?.confidence).toBe(0.95);
  });

  it("extracts JSON from code block without language tag", () => {
    const input = '```\n{"confidence":0.8}\n```';
    const result = extractJSON<{ confidence: number }>(input);
    expect(result?.confidence).toBe(0.8);
  });

  it("extracts JSON object from surrounding text", () => {
    const input =
      'The parsed result is: {"session":{"date":"2026-04-12","name":"Legs"},"sets":[],"confidence":0.7} Hope that helps!';
    const result = extractJSON<{ session: { name: string } }>(input);
    expect(result?.session.name).toBe("Legs");
  });

  it("returns null for non-JSON text", () => {
    expect(extractJSON("This is just text with no JSON")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(extractJSON('{"broken": true')).toBeNull();
  });

  it("handles nested objects", () => {
    const input =
      '{"session":{"date":"2026-04-12","name":"Push"},"sets":[{"exercise":"Bench Press","set_number":1,"reps":8,"weight":185,"weight_unit":"lbs","rpe":7}],"confidence":0.95,"ambiguities":[]}';
    const result = extractJSON<{ sets: Array<{ exercise: string }> }>(input);
    expect(result?.sets).toHaveLength(1);
    expect(result?.sets[0].exercise).toBe("Bench Press");
  });
});
