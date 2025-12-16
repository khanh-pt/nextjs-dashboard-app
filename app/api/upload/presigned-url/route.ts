import { apiFetch } from '@/app/common/fetch';

export async function POST(req: Request) {
  console.log('Received request for presigned URL');
  const { filename, contentType, checksum, size } = await req.json();

  const res = await apiFetch(`${process.env.NEST_BE_URL}/files/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename,
      contentType,
      checksum,
      size,
    }),
  });

  if (!res.ok) {
    return Response.json(
      { error: 'Failed to get presigned URL' },
      { status: res.status, statusText: res.statusText },
    );
  }

  const data = await res.json();
  return Response.json(data);
}
