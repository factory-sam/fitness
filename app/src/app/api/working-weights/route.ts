import { getAllWorkingWeights } from "../../../lib/queries";

export async function GET() {
  const data = getAllWorkingWeights();
  return Response.json(data);
}
