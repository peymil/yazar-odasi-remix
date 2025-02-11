import { useLoaderData, useNavigate } from 'react-router';
import invariant from 'tiny-invariant';
import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';
import { Button } from '~/components/ui/button';
import { PostFeed } from '~/components/PostFeed';
import { Route } from './+types/route';

export async function loader({ params, request }: Route.ActionArgs) {
  invariant(params.id, 'Company ID is required');
  const companyId = parseInt(params.id);
  const session = await getSessionFromRequest(request);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      company_profile: true,
      post: {
        orderBy: {
          created_at: 'desc',
        },
        include: {
          user: {
            include: {
              user_profile: true,
            },
          },
          company: true,
        },
      },
    },
  });

  if (!company) {
    throw new Response('Company not found', { status: 404 });
  }

  const isCompanyUser = session?.user
    ? await prisma.company_user.findFirst({
        where: {
          user_id: session.user.id,
          company_id: companyId,
        },
      })
    : null;

  const likedPosts = session?.user
    ? await prisma.post_like.findMany({
        where: { user_id: session.user.id },
        select: { post_id: true },
      })
    : [];

  return {
    company,
    isCompanyUser: !!isCompanyUser,
    likedPostIds: likedPosts.map((like) => like.post_id),
  };
}

export default function CompanyProfile({ loaderData }: Route.ComponentProps) {
  const { company, isCompanyUser, likedPostIds } = loaderData;
  const profile = company.company_profile[0];
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-4xl mt-10">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {company.avatar ? (
              <img
                src={company.avatar}
                alt={company.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-500">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="ml-6">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="text-gray-600">{company.email}</p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yo-orange hover:underline"
                >
                  {profile.website}
                </a>
              )}
            </div>
          </div>
          {isCompanyUser && (
            <Button
              className="bg-yo-orange text-white"
              onClick={() => {
                /* TODO: Add edit functionality */
              }}
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="border-t mt-6 pt-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {profile.description}
          </p>
        </div>
      </div>

      {/* Company Posts */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Company Posts</h2>
          {isCompanyUser && (
            <Button
              className="bg-yo-orange text-white"
              onClick={() => navigate('/post/new')}
            >
              New Post
            </Button>
          )}
        </div>
        <PostFeed
          posts={company.post.map((post) => ({
            ...post,
          }))}
          likedPostIds={likedPostIds}
          onLike={async (postId) => {
            const formData = new FormData();
            formData.append('postId', postId.toString());
            await fetch('/api/posts/like', {
              method: 'POST',
              body: formData,
            });
          }}
        />
      </div>
    </div>
  );
}
