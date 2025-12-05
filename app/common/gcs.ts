'use server';

import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';

// Initialize GCS client
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCS_BUCKET_NAME!;

/**
 * Generate a presigned URL for uploading a file to GCS
 * @param fileName - The name of the file to upload
 * @param contentType - The MIME type of the file
 * @returns Object containing the presigned URL and the key (file path in bucket)
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  fileSize: number,
  contentType: string,
): Promise<{ url: string; key: string }> {
  const lastDotIndex = fileName.lastIndexOf('.');
  const fileExtension =
    lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
  const { randomUUID } = await import('crypto');

  // Generate a unique key for the file
  const key = `uploads/${randomUUID()}${fileExtension}`;

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(key);

  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
    extensionHeaders: {
      'x-goog-content-length-range': `0,${fileSize}`,
    },
  };

  const [signedUrl] = await file.getSignedUrl(options);
  return { url: signedUrl, key };
}

/**
 * Get a public URL for a file stored in GCS
 * @param key - The key (file path) of the file in the bucket
 * @returns The public URL of the file
 */
// export async function getPublicUrl(key: string): Promise<string> {
//   if (!key) return '';

//   // If bucket is public, use direct URL
//   return `https://storage.googleapis.com/${bucketName}/${key}`;
// }

/**
 * Generate a signed URL for viewing a private file
 * @param key - The key (file path) of the file in the bucket
 * @returns The signed URL for viewing the file
 */
export async function generatePresignedViewUrl(key: string): Promise<string> {
  if (!key) return '';

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(key);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  return url;
}

/**
 * Delete a file from GCS
 * @param key - The key (file path) of the file to delete
 */
export async function deleteFile(key: string): Promise<void> {
  if (!key) return;

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(key);

  await file.delete();
}
