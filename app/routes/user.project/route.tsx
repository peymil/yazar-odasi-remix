import { prisma } from '~/.server/prisma';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import { Footer } from '~/components/Footer';
import type { Route } from './+types/route';

const PAGE_SIZE = 10;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [projects, total] = await Promise.all([
    prisma.user_profile_project.findMany({
      skip,
      take: PAGE_SIZE,
      include: {
        project_projectgenre: {
          include: { project_genre: true },
        },
        project_projecttag: {
          include: { project_tag: true },
        },
        user_profile: true,
      },
      orderBy: { id: 'desc' },
    }),
    prisma.user_profile_project.count(),
  ]);

  const mappedProjects = projects.map((project) => ({
    id: project.id,
    userId: project.user_profile?.user_id ?? 0,
    title: project.plot_title,
    synopsis: project.synopsis,
    image: project.image ?? null,
    genres: (project.project_projectgenre.map((g) => g.project_genre?.genre_name).filter(Boolean) as string[]),
    tags: (project.project_projecttag.map((t) => t.project_tag?.tag_name).filter(Boolean) as string[]),
  }));

  return {
    projects: mappedProjects,
    total,
    page,
  } as const;
}

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({
  id,
  userId,
  title,
  synopsis,
  image = null,
  genres = [],
  tags = [],
}: {
  id: number;
  userId: number;
  title: string;
  synopsis: string;
  image?: string | null;
  genres?: string[];
  tags?: string[];
}) {
  return (
    <Link
      to={`/user/${userId}/profile/project/${id}/about`}
      className="flex items-start gap-4 px-5 py-5 border border-gray-200 rounded-sm w-full hover:border-yo-orange transition-colors"
    >
      {/* Image */}
      <div className="flex-shrink-0 w-28 h-36 border border-yo-orange rounded-sm">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-sm"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3">
        <div>
          <span className="block text-[#231f20] text-base leading-tight font-semibold mb-2">
            {title}
          </span>
          {synopsis && (
            <p className="text-[#666] text-sm leading-snug line-clamp-2">
              {synopsis}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <span
              key={genre}
              className="px-2.5 py-1 bg-gray-100 text-[#231f20] text-xs rounded-sm whitespace-nowrap"
            >
              {genre}
            </span>
          ))}
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-yo-orange/10 text-[#231f20] text-xs rounded-sm whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 w-5 h-5 text-yo-orange flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-full h-full">
          <path d="M7.5 4L13.5 10L7.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total }: { page: number; total: number }) {
  const [searchParams] = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  function pageLink(p: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    return `/user/project?${next.toString()}`;
  }

  // Show at most 7 page buttons: first, last, current ±2, and ellipses
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Link
        to={pageLink(page - 1)}
        aria-disabled={page === 1}
        className={`px-3 py-1.5 border rounded-sm text-sm transition-colors ${
          page === 1
            ? 'border-gray-200 text-gray-300 pointer-events-none'
            : 'border-[#231f20] text-[#231f20] hover:border-yo-orange hover:text-yo-orange'
        }`}
      >
        ‹
      </Link>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">
            …
          </span>
        ) : (
          <Link
            key={p}
            to={pageLink(p as number)}
            className={`px-3 py-1.5 border rounded-sm text-sm transition-colors ${
              p === page
                ? 'bg-yo-orange border-yo-orange text-white'
                : 'border-[#231f20] text-[#231f20] hover:border-yo-orange hover:text-yo-orange'
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        to={pageLink(page + 1)}
        aria-disabled={page === totalPages}
        className={`px-3 py-1.5 border rounded-sm text-sm transition-colors ${
          page === totalPages
            ? 'border-gray-200 text-gray-300 pointer-events-none'
            : 'border-[#231f20] text-[#231f20] hover:border-yo-orange hover:text-yo-orange'
        }`}
      >
        ›
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectsRoute() {
  const { projects, total, page } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-6">
        {/* Orange rule – aligned right */}
        <div className="flex mb-5">
          <div className="flex-1" />
          <div className="h-0.5 bg-yo-orange w-1/2" />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                id={project.id}
                userId={project.userId}
                title={project.title}
                synopsis={project.synopsis}
                image={project.image}
                genres={project.genres}
                tags={project.tags}
              />
            ))}
            {projects.length === 0 && (
              <p className="text-center text-gray-500 py-10">Proje bulunamadı.</p>
            )}
          </div>
          <Pagination page={page} total={total} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
