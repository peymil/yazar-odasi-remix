import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/.server/prisma";
import { getSessionFromRequest } from "~/.server/auth";
import { Button } from "~/components/ui/button";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.id, "Company ID is required");
  const companyId = parseInt(params.id);
  const session = await getSessionFromRequest(request);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      company_profile: true,
      post: {
        orderBy: {
          created_at: 'desc'
        },
        include: {
          user: true
        }
      }
    }
  });

  if (!company) {
    throw new Response("Company not found", { status: 404 });
  }

  const isCompanyUser = session?.user ? await prisma.company_user.findFirst({
    where: {
      user_id: session.user.id,
      company_id: companyId
    }
  }) : null;

  return json({ company, isCompanyUser: !!isCompanyUser });
}

export default function CompanyProfile() {
  const { company, isCompanyUser } = useLoaderData<typeof loader>();
  const profile = company.company_profile[0];

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
              onClick={() => {/* TODO: Add edit functionality */}}
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="border-t mt-6 pt-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
        </div>
      </div>

      {/* Company Posts */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Company Posts</h2>
          {isCompanyUser && (
            <Button className="bg-yo-orange text-white">
              New Post
            </Button>
          )}
        </div>
        {company.post.length > 0 ? (
          <div className="space-y-6">
            {company.post.map((post) => (
              <div key={post.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center mb-4">
                  <img
                    src={post.user.image || "https://cdn.yazarodasi.com/profile-photo-placeholder.webp"}
                    alt={`${post.user.email}'s avatar`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">{post.user.email}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{post.content}</p>
                <div className="mt-2 text-gray-500">
                  <span>{post.likes || 0} likes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No posts yet</p>
        )}
      </div>
    </div>
  );
}