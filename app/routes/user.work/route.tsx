import { prisma } from '~/.server/prisma';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import { SearchBar } from '~/components/SearchBar';
import { workSearch } from '@prisma/client/sql';
import { work_genre, work_tag } from '@prisma/client';
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
    return {
      works: [] as workSearch.Result[],
      total: 0,
    };
  }

  const works = await prisma.$queryRawTyped(
    workSearch(searchQuery, limit, take)
  );
  const total = works.length;

  return {
    works,
    total,
  };
}

export default function WorkSearch() {
  const { works, total } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const limitParam = searchParams.get('limit');
  const takeParam = searchParams.get('take');
  const limit = limitParam ? parseInt(limitParam) : 50;
  const take = takeParam ? parseInt(takeParam) : 0;
  const searchQuery = searchParams.get('q');
  const hasSearchQuery = Boolean(searchQuery && searchQuery.length >= 2);

  const hasMore = works.length === limit;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">İş Arama</h1>
      <SearchBar className="mb-8" placeholder="Search works by title..." />

      {hasSearchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          Found {total} work{total !== 1 ? 's' : ''}
        </div>
      )}

      <div className="bg-white rounded-lg shadow space-y-4 p-4">
        {works.map((work) => (
          <Link
            key={work.id}
            to={`/user/${work.user_id}/profile/work/${work.id}/about`}
            className="block"
          >
            <div className="p-4 border rounded-lg hover:border-yo-orange transition-colors duration-200">
              <h2 className="text-xl font-bold mb-2">{work.plot_title}</h2>
              <div className="flex flex-wrap gap-2">
                {(work.genres as work_genre[])
                  .filter((genre) => genre.genre_name)
                  .map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-gray-100 text-sm rounded"
                    >
                      {genre.genre_name}
                    </span>
                  ))}
                {(work.tags as work_tag[])
                  .filter((tag) => tag.tag_name)
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 bg-yo-orange/10 text-sm rounded"
                    >
                      {tag.tag_name}
                    </span>
                  ))}
              </div>
            </div>
          </Link>
        ))}
        {hasSearchQuery && works.length === 0 && (
          <p className="text-center text-gray-500">
            No works found. Try a different search term.
          </p>
        )}
        {!hasSearchQuery && (
          <p className="text-center text-gray-500">
            Enter at least 2 characters to search
          </p>
        )}
      </div>

      {hasSearchQuery && hasMore && (
        <Pagination
          currentPage={Math.floor(take / limit) + 1}
          totalPages={Math.ceil(total / limit)}
          onPageChange={(page) => {
            const params = new URLSearchParams(searchParams);
            params.set('take', ((page - 1) * limit).toString());
            window.location.search = params.toString();
          }}
        />
      )}
    </div>
  );
}