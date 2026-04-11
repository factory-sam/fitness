import {
  getBodyCompHistory,
  getMeasurements,
  getLatestBodyComp,
  getLatestMeasurements,
} from "../../lib/queries";
import { BodyCompChart } from "../../components/dashboard/body-comp-chart";
import { MeasurementDisplay } from "../../components/body/measurement-display";

export const dynamic = "force-dynamic";

export default function BodyPage() {
  const bodyCompHistory = getBodyCompHistory() as Record<string, unknown>[];
  const measurementHistory = getMeasurements() as Record<string, unknown>[];
  const latestComp = getLatestBodyComp() as Record<string, unknown> | undefined;
  const latestMeasurements = getLatestMeasurements() as Record<string, unknown> | undefined;

  const swRatio =
    latestMeasurements?.shoulders && latestMeasurements?.waist
      ? (
          (latestMeasurements.shoulders as number) /
          (latestMeasurements.waist as number)
        ).toFixed(3)
      : null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="font-serif text-2xl text-text">Body & Measurements</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          Track composition and measurements monthly
        </p>
      </header>

      {/* Current stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="metric-label">Weight</p>
          <p className="metric-value text-xl">
            {(latestComp?.weight_lbs as number) ?? "—"}
          </p>
          <p className="font-mono text-[10px] text-text-muted">lbs</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">Body Fat</p>
          <p className="metric-value text-xl">
            {(latestComp?.body_fat_pct as number) ?? "—"}%
          </p>
          <p className="font-mono text-[10px] text-text-muted">target: 12–18%</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">S/W Ratio</p>
          <p className="metric-value text-xl">{swRatio ?? "—"}</p>
          <p className="font-mono text-[10px] text-text-muted">target: 1.57</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">VO₂ Max</p>
          <p className="metric-value text-xl">
            {(latestComp?.vo2_max as number) ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BodyCompChart history={bodyCompHistory} measurements={measurementHistory} />
        <MeasurementDisplay
          latest={latestMeasurements}
          history={measurementHistory}
          swRatio={swRatio}
        />
      </div>
    </div>
  );
}
