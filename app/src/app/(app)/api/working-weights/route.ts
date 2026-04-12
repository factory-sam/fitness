import { getAllWorkingWeights } from "../../../../lib/queries";
import { requireAuth } from "../../../../lib/api-auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const data = await getAllWorkingWeights();
  return Response.json(data);
}
