import { type ActionFunctionArgs, data } from 'react-router';
import { generatePresignedUrl, ALLOWED_FILE_TYPES } from '~/.server/s3';
import { validateSessionToken } from '~/.server/auth';
import { authTokenCookie } from '~/.server/cookies';
import { randomUUID } from 'crypto';

export type S3FolderNames = "competition-applications" | "profile-pictures"

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  if (!sessionToken) {
    return data({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await validateSessionToken(sessionToken);
  if (!session?.user) {
    return data({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const filename = formData.get('filename');
    const folder = formData.get('folder') as S3FolderNames;
    const contentType = formData.get('contentType');

    if (!filename || !contentType || !folder || typeof filename !== 'string' || typeof contentType !== 'string') {
      return data({ error: 'Filename and content type are required' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(contentType)) {
      return data({ error: 'Invalid file type' }, { status: 400 });
    }

    const uuid = randomUUID();
    const filePath = `${folder}/${uuid}-${filename}`;

    const presignedUrl = await generatePresignedUrl(filePath, contentType, 'upload');

    return data({
      presignedUrl,
      filePath,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return data({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }
}

export async function loader() {
  return data({ error: 'Method not allowed' }, { status: 405 });
}