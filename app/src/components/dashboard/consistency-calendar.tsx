"use client";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

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

  const grid: (typeof cells)[] = [];
  for (let i = 0; i < 7; i++) {
    grid.push([]);
  }
  cells.forEach((cell) => {
    const dayOfWeek = new Date(cell.date).getDay();
    grid[dayOfWeek].push(cell);
  });

  return (
    <div className="card">
      <h2 className="section-heading mb-3">Consistency</h2>
      <div className="flex gap-[3px]">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[10px] flex items-center">
              {i % 2 === 1 && (
                <span className="type-micro text-text-muted leading-none text-[9px]">{label}</span>
              )}
            </div>
          ))}
        </div>
        {Array.from({ length: weeks }, (_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-[3px]">
            {grid.map((row, dayIdx) => {
              const cell = row[weekIdx];
              if (!cell) return <div key={dayIdx} className="w-[10px] h-[10px]" />;
              return (
                <div
                  key={dayIdx}
                  className={`w-[10px] h-[10px] rounded-sm transition-colors ${
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
      <p className="type-micro text-text-muted mt-2">Last 12 weeks</p>
    </div>
  );
}
