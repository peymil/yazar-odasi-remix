import { data, redirect, type MetaFunction } from 'react-router';
import { useFetcher, useLoaderData, useSubmit } from 'react-router';
import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { PostEditor } from '~/components/PostEditor';
import { PostFeed } from '~/components/PostFeed';
import { SignUp } from '~/components/sign-up';
import { useOptionalUser } from '~/lib/authUtils';
import { validateSessionToken } from '~/.server/auth';
import { authTokenCookie } from '~/.server/cookies';
import { prisma } from '~/.server/prisma';
export const meta: MetaFunction = () => {
  return [
    { title: 'Yazar Odasi' },
    { name: 'description', content: 'Yazarodasi is a place for writers.' },
  ];
};
import { Route } from './+types/_index';

export async function loader({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  if (!sessionToken) {
    return { posts: [], likedPostIds: [], companies: [] };
  }

  const session = await validateSessionToken(sessionToken);
  if (!session?.user) {
    return { posts: [], likedPostIds: [], companies: [] };
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

  const posts = await prisma.post.findMany({
    orderBy: { created_at: 'desc' },
    take: 20,
    include: {
      user: {
        include: {
          user_profile: true,
        },
      },
      company: true,
    },
  });

  const profile = await prisma.user_profile.findFirst({
    where: { user_id: session.user.id },
    select: { id: false, name: true },
  });

  const likedPosts = await prisma.post_like.findMany({
    where: { user_id: session.user.id },
    select: { post_id: true },
  });
  return {
    posts,
    likedPostIds: likedPosts.map((like) => like.post_id),
    companies: userCompanies.map((uc) => uc.company),
  };
}

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

export default function Index() {
  const isAuthenticated = useOptionalUser();
  const { posts, likedPostIds, companies } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const [optimisticLikes, setOptimisticLikes] = useState<
    Record<number, boolean>
  >({});

  const handleLike = (postId: number) => {
    const formData = new FormData();
    formData.append('postId', postId.toString());

    const isCurrentlyLiked = likedPostIds.includes(postId);

    // Optimistically update the UI
    setOptimisticLikes((prev) => ({
      ...prev,
      [postId]: !isCurrentlyLiked,
    }));

    fetcher.submit(formData, {
      method: 'post',
      action: '/api/posts/like',
    });
  };

  const getOptimisticLikeCount = (post: {
    id: number;
    likes: number | null;
  }) => {
    const isCurrentlyLiked = likedPostIds.includes(post.id);
    const hasOptimisticUpdate = optimisticLikes.hasOwnProperty(post.id);
    const isOptimisticallyLiked = optimisticLikes[post.id];

    if (!hasOptimisticUpdate) {
      return post.likes || 0;
    }

    return isOptimisticallyLiked
      ? isCurrentlyLiked
        ? post.likes || 0
        : (post.likes || 0) + 1
      : isCurrentlyLiked
      ? (post.likes || 0) - 1
      : post.likes || 0;
  };

  const isPostLiked = (postId: number) => {
    const hasOptimisticUpdate = optimisticLikes.hasOwnProperty(postId);
    return hasOptimisticUpdate
      ? optimisticLikes[postId]
      : likedPostIds.includes(postId);
  };

  const submit = useSubmit();
  const handleSubmit = (data: { content: string; companyId?: number }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.companyId) {
      formData.append('companyId', data.companyId.toString());
    }
    submit(formData, { method: 'post' });
    //refresh page
    window.location.reload();
  };

  return isAuthenticated ? (
    <div className="container mx-auto py-8 space-y-8">
      <ClientOnly>
        {() => <PostEditor companies={companies} onSubmit={handleSubmit} />}
      </ClientOnly>
      <PostFeed
        posts={posts.map((post) => ({
          ...post,
          likes: getOptimisticLikeCount(post),
        }))}
        likedPostIds={posts.map((post) => post.id).filter(isPostLiked)}
        onLike={handleLike}
      />
    </div>
  ) : (
    <div
      className={
        'container mx-auto flex items-center justify-center h-[calc(100vh-144px)]'
      }
    >
      <div className={'flex-1 flex flex-col justify-center items-center'}>
        <img
          src={'https://cdn.yazarodasi.com/startup-hero.png'}
          alt={'Illustration of three writers smiling'}
        />
        <h1 className={'text-5xl'}>{"Yazar Odası'na Katıl"}</h1>
        <p className={'text-center'}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          mattis mauris a magna venenatis semper. Suspendisse placerat porta
          orci, a vehicula sem suscipit feugiat.
        </p>
      </div>
      <div className={'flex-1 p-56'}>
        <SignUp action={'/auth/sign-up'} />
      </div>
    </div>
  );
}
