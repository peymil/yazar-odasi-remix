import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand,S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_PRESIGNED_URL_AGE = 3600; // 1 hour in seconds

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  }
});

export async function generatePresignedUrl(
  key: string,
  contentType: string,
  operation: 'upload' | 'download' = 'upload'
) {
  if (operation === 'upload' && !ALLOWED_FILE_TYPES.includes(contentType)) {
    throw new Error('Invalid file type. Only PDF files are allowed.');
  }

  const command = operation === 'upload'
    ? new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      })
    : new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

  try {
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: MAX_PRESIGNED_URL_AGE,
    });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}