import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '~/.server/s3';
import { Route } from './+types/route';
import { data } from 'react-router';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;

  if (!file) {
    return data({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return data({ error: 'File size exceeds 5MB limit' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${type}/${Date.now()}-${file.name}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    const url = `${process.env.S3_PUBLIC_URL}/${key}`;

    return { url };
  } catch (error) {
    console.error('Upload error:', error);
    return data({ error: 'Failed to upload file' }, { status: 500 });
  }
}
