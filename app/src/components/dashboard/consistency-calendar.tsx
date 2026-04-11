"use client";

export function ConsistencyCalendar({ dates }: { dates: string[] }) {
  const today = new Date();
  const weeks = 12;
  const days = weeks * 7;
  const dateSet = new Set(dates);

  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const isWorkout = dateSet.has(dateStr);
    const isToday = i === 0;
    cells.push({ date: dateStr, isWorkout, isToday });
  }

  const grid: typeof cells[] = [];
  for (let i = 0; i < 7; i++) {
    grid.push([]);
  }
  cells.forEach((cell, idx) => {
    const dayOfWeek = new Date(cell.date).getDay();
    grid[dayOfWeek].push(cell);
  });

  return (
    <div className="card">
      <h2 className="section-heading mb-3">Consistency</h2>
      <div className="flex gap-[3px]">
        {Array.from({ length: weeks }, (_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-[3px]">
            {grid.map((row, dayIdx) => {
              const cell = row[weekIdx];
              if (!cell) return <div key={dayIdx} className="w-3 h-3" />;
              return (
                <div
                  key={dayIdx}
                  className={`w-3 h-3 rounded-sm transition-colors ${
                    cell.isWorkout
                      ? "bg-gold"
                      : cell.isToday
                      ? "border border-gold-dim bg-bg-elevated"
                      : "bg-bg-elevated"
                  }`}
                  title={`${cell.date}${cell.isWorkout ? " — workout" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-text-muted mt-2">
        Last 12 weeks · Gold = workout day
      </p>
    </div>
  );
}
