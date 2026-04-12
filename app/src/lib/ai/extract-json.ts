export function extractJSON<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const target = fenced ? fenced[1].trim() : text.trim();

  try {
    return JSON.parse(target) as T;
  } catch {
    const braceMatch = target.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
