import { prisma } from '~/.server/prisma';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import { SearchBar } from '~/components/SearchBar';
import { projectSearch } from '@prisma/client/sql';
import { project_genre, project_tag } from '@prisma/client';
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
      projects: [] as projectSearch.Result[],
      total: 0,
    };
  }

  const projects = await prisma.$queryRawTyped(
    projectSearch(searchQuery, limit, take)
  );
  const total = projects.length;

  return {
    projects,
    total,
  };
}

export default function ProjectSearch() {
  const { projects, total } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const limitParam = searchParams.get('limit');
  const takeParam = searchParams.get('take');
  const limit = limitParam ? parseInt(limitParam) : 50;
  const take = takeParam ? parseInt(takeParam) : 0;
  const searchQuery = searchParams.get('q');
  const hasSearchQuery = Boolean(searchQuery && searchQuery.length >= 2);

  const hasMore = projects.length === limit;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Project Search</h1>
      <SearchBar className="mb-8" placeholder="Search projects by title..." />

      {hasSearchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          Found {total} project{total !== 1 ? 's' : ''}
        </div>
      )}

      <div className="bg-white rounded-lg shadow space-y-4 p-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/user/${project.user_id}/profile/project/${project.id}/about`}
            className="block"
          >
            <div className="p-4 border rounded-lg hover:border-yo-orange transition-colors duration-200">
              <h2 className="text-xl font-bold mb-2">{project.plot_title}</h2>
              <div className="flex flex-wrap gap-2">
                {(project.genres as project_genre[])
                  .filter((genre) => genre.genre_name)
                  .map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-gray-100 text-sm rounded"
                    >
                      {genre.genre_name}
                    </span>
                  ))}
                {(project.tags as project_tag[])
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
        {hasSearchQuery && projects.length === 0 && (
          <p className="text-center text-gray-500">
            No projects found. Try a different search term.
          </p>
        )}
        {!hasSearchQuery && (
          <p className="text-center text-gray-500">
            Enter at least 2 characters to search
          </p>
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
