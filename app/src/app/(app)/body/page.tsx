import {
  getBodyCompHistory,
  getMeasurements,
  getLatestBodyComp,
  getLatestMeasurements,
} from "../../../lib/queries";
import { BodyCompChart } from "../../../components/dashboard/body-comp-chart";
import { MeasurementDisplay } from "../../../components/body/measurement-display";

export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const bodyCompHistory = await getBodyCompHistory();
  const measurementHistory = await getMeasurements();
  const latestComp = await getLatestBodyComp();
  const latestMeasurements = await getLatestMeasurements();

  const swRatio =
    latestMeasurements?.shoulders && latestMeasurements?.waist
      ? (Number(latestMeasurements.shoulders) / Number(latestMeasurements.waist)).toFixed(3)
      : null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="type-heading text-text">Body & Measurements</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          Track composition and measurements monthly
        </p>
      </header>

      {/* Current stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="metric-label">Weight</p>
          <p className="metric-value text-xl">
            {latestComp?.weight_lbs ?? "—"}
          </p>
          <p className="type-micro text-text-muted">lbs</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">Body Fat</p>
          <p className="metric-value text-xl">
            {latestComp?.body_fat_pct ?? "—"}%
          </p>
          <p className="type-micro text-text-muted">target: 12-18%</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">S/W Ratio</p>
          <p className="metric-value-accent text-xl">{swRatio ?? "—"}</p>
          <p className="type-micro text-text-muted">target: 1.57</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">VO₂ Max</p>
          <p className="metric-value text-xl">
            {latestComp?.vo2_max ?? "—"}
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
