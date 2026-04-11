import { getAllWorkingWeights } from "../../../../lib/queries";

export async function GET() {
  const data = await getAllWorkingWeights();
  return Response.json(data);
}
