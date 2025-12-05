import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl } from '@/app/common/gcs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, contentType, checksum, fileSize } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 },
      );
    }

    if (!checksum) {
      return NextResponse.json(
        { error: 'File checksum is required for validation' },
        { status: 400 },
      );
    }

    // Validate content type (only allow images)
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 },
      );
    }

    // Validate file size
    if (fileSize && fileSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 },
      );
    }

    const { url, key } = await generatePresignedUploadUrl(
      fileName,
      fileSize,
      contentType,
    );

    // Return the URL and key
    return NextResponse.json({ url, key });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 },
    );
  }
}
