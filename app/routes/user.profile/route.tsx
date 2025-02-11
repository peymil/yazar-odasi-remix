import { type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useSearchParams } from 'react-router';
import { SearchBar } from '~/components/SearchBar';
import { UserProfileItem } from '~/components/UserProfileItem';
import { prisma } from '~/.server/prisma';
import type { user_profile } from '@prisma/client';
import { profileSearch } from '@prisma/client/sql';
import { Pagination } from '~/components/ui/pagination';
import { Route } from './+types/route';

export async function loader({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q');
  const limitParam = url.searchParams.get('limit');
  const takeParam = url.searchParams.get('take');
  const limit = limitParam ? parseInt(limitParam) : 50;
  const take = takeParam ? parseInt(takeParam) : 0;

  if (!searchQuery || searchQuery.length < 2) {
    return { profiles: [], total: 0 };
  }

  const results = await prisma.$queryRawTyped(
    profileSearch(searchQuery, limit, take)
  );

  const profiles = results.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    current_title: row.current_title,
    about: row.about,
    contact_email: null,
    background_image: null,
    user: {
      email: row.email,
      image: row.image,
    },
  }));

  const total = results.length > 0 ? Number(results[0].total_count) : 0;

  return { profiles, total };
}

export default function UserProfileSearchRoute() {
  const { profiles, total } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const limitParam = searchParams.get('limit');
  const takeParam = searchParams.get('take');
  const limit = limitParam ? parseInt(limitParam) : 50;
  const take = takeParam ? parseInt(takeParam) : 0;
  const searchQuery = searchParams.get('q');
  const hasSearchQuery = Boolean(searchQuery && searchQuery.length >= 2);

  const hasMore = profiles.length === limit;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Search Writer Profiles
      </h1>

      <SearchBar className="mb-8" />

      {hasSearchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          Found {total} profile{total !== 1 ? 's' : ''}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {profiles.map((profile) => (
          <UserProfileItem
            key={profile.id}
            id={profile.id}
            name={profile.name}
            userId={profile.user_id}
            currentTitle={profile.current_title}
            about={profile.about}
            user={profile.user}
          />
        ))}

        {hasSearchQuery && profiles.length === 0 && (
          <div className="p-4 text-center text-gray-500">No profiles found</div>
        )}

        {!hasSearchQuery && (
          <div className="p-4 text-center text-gray-500">
            Enter at least 2 characters to search
          </div>
        )}
      </div>

      <Pagination
        hasMore={hasMore}
        take={take}
        limit={limit}
        className="mt-4"
      />
    </div>
  );
}
