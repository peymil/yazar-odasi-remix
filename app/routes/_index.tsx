import { data, redirect, type MetaFunction } from 'react-router';
import { useFetcher, useLoaderData, useSubmit } from 'react-router';
import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import PostEditor from '~/components/PostEditor';
import { PostFeed } from '~/components/PostFeed';
import { SignUp } from '~/components/sign-up';
import { useOptionalUser } from '~/lib/authUtils';
import { validateSessionToken } from '~/.server/auth';
import { authTokenCookie } from '~/.server/cookies';
import { prisma } from '~/.server/prisma';
import { BowFrame } from '~/components/BowFrame';
import { Footer } from '~/components/Footer';

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

  if (isAuthenticated) {
    return null;
  }

  // Landing page for non-authenticated users
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-white">

      {/* Section 1 */}
      <section className="snap-start h-screen flex items-center justify-center px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full max-w-[1056px]">
          <div className="flex flex-col gap-6">
            <h1 className="text-[#231f20] font-extrabold text-2xl leading-normal font-balkist">
              Herkes senin hikayeni bekliyor!
            </h1>
            <p className="text-[#231f20] text-xl leading-normal font-normal font-secondary">
              Özgün hikayeleriyle yüzlerce yazar ve doğru projeyi arayan onlarca
              yapımcı ve yayıncı Yazar Odası'nda buluşuyor.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src="/images/writer-illustration.png"
              alt="Illustration of a writer"
              className="w-full max-w-[257px] h-auto object-contain rotate-180 -scale-y-100"
            />
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="snap-start h-screen flex items-center justify-center px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full max-w-[1056px]">
          <div className="flex justify-center lg:justify-start">
            <img
              src="/images/boxer-illustration.png"
              alt="Illustration of a boxer"
              className="w-full max-w-[266px] h-auto object-contain"
            />
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-[#231f20] font-extrabold text-2xl leading-normal font-balkist">
              Keşfedilmek için yapabileceğiniz yazmaktan başka şeyler de var.
            </h2>
            <p className="text-[#231f20] text-xl leading-normal font-normal font-secondary">
              Yazar Odası'nda kendinize ait bir oda oluşturun, proje ve
              hikayeleriniz doğru kişilere ulaşsın.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="snap-start h-screen flex items-center justify-center px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full max-w-[1056px]">
          <div className="flex flex-col gap-6">
            <h2 className="text-[#231f20] font-extrabold text-2xl leading-normal font-balkist">
              Bir hikaye, birilerine ulaşana kadar bitmez.
            </h2>
            <p className="text-[#231f20] text-xl leading-normal font-normal font-secondary">
              Yayıncı ve yapımcıların açık çağrılarını inceleyin, hikaye ve
              projelerinizi gönderin.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src="/images/elderly-illustration.png"
              alt="Illustration of an elderly person"
              className="w-full max-w-[281px] h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="snap-start h-screen flex items-center justify-center px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full max-w-[1056px]">
          <div className="flex justify-center lg:justify-start">
            <img
              src="/images/documents-illustration.png"
              alt="Illustration of a person with documents"
              className="w-full max-w-[217px] h-auto object-contain"
            />
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-[#231f20] font-extrabold text-2xl leading-normal font-balkist">
              Tüm hikayelerinizi koruma altına alın.
            </h2>
            <p className="text-[#231f20] text-xl leading-normal font-normal font-secondary">
              Proje ve hikayelerinizi Yazar Odası'nda tasdikleyerek zaman
              damgasıyla koruma altına alın.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="snap-start flex items-center justify-center px-10 py-10">
        <Footer />
      </section>

    </div>
  );
}
