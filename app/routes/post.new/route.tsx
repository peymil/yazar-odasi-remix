import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from 'react-router';
import { ClientOnly } from 'remix-utils/client-only';
import { validateSessionToken } from '~/.server/auth';
import { authTokenCookie } from '~/.server/cookies';
import { prisma } from '~/.server/prisma';
import { PostEditor } from '~/components/PostEditor';
import { Route } from './+types/route';

export async function loader({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  if (!sessionToken) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const session = await validateSessionToken(sessionToken);
  if (!session?.user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Get user's companies
  const userCompanies = await prisma.company_user.findMany({
    where: { user_id: session.user.id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    companies: userCompanies.map((uc) => uc.company),
  };
}

type ActionData = { error: string } | { success: boolean };

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  if (!sessionToken) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const session = await validateSessionToken(sessionToken);
  if (!session?.user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const content = formData.get('content');
  const companyId = formData.get('companyId');

  if (!content || typeof content !== 'string') {
    return data({ error: 'Content is required' }, { status: 400 });
  }

  try {
    await prisma.post.create({
      data: {
        content,
        user_id: session.user.id,
        company_id: companyId ? parseInt(companyId.toString()) : null,
      },
    });

    return redirect('/');
  } catch (error) {
    console.error('Failed to create post:', error);
    return data({ error: 'Failed to create post' }, { status: 500 });
  }
}

export default function NewPost() {
  const { companies } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const isError = (
    data: ActionData | undefined | null
  ): data is { error: string } => {
    return data !== null && data !== undefined && 'error' in data;
  };
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const submit = useSubmit();
  const handleSubmit = (data: { content: string; companyId?: number }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.companyId) {
      formData.append('companyId', data.companyId.toString());
    }
    submit(formData, { method: 'post' });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      {isError(actionData) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}
      <ClientOnly
        fallback={
          <div className="w-full max-w-4xl mx-auto h-[300px] border rounded-md bg-gray-50" />
        }
      >
        {() => (
          <PostEditor
            companies={companies}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </ClientOnly>
    </div>
  );
}
