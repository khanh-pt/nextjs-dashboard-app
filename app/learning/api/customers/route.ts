import { fetchCustomers } from '../../learning/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 1);

  const customers = await fetchCustomers(page);
  return Response.json({ customers });
}
