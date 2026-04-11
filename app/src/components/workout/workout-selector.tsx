"use client";

import { useEffect, useState } from "react";

interface Day {
  id: number;
  day_number: number;
  day_name: string;
  focus: string;
}

export function WorkoutSelector({
  onSelect,
}: {
  onSelect: (dayNumber: number) => void;
}) {
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    fetch("/api/programme")
      .then((r) => r.json())
      .then(setDays);
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl text-text mb-2">Start Workout</h1>
      <p className="font-mono text-xs text-text-muted mb-6">
        Select today&apos;s session from your programme
      </p>

      <div className="space-y-3">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => onSelect(day.day_number)}
            className="card w-full text-left hover:border-gold-dim transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-gold-dim">
                    Day {day.day_number}
                  </span>
                  <span className="font-mono text-sm text-text font-medium">
                    {day.day_name}
                  </span>
                </div>
                <p className="font-mono text-xs text-text-muted">
                  {day.focus}
                </p>
              </div>
              <span className="text-text-muted group-hover:text-gold transition-colors text-lg">
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      {days.length === 0 && (
        <div className="card text-center py-12">
          <p className="font-mono text-sm text-text-secondary">
            Loading programme...
          </p>
        </div>
      )}
    </div>
  );
}
