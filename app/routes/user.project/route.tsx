import { prisma } from '~/.server/prisma';
import { useEffect, useRef, useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import { Footer } from '~/components/Footer';
import type { Route } from './+types/route';

const PAGE_SIZE = 10;

type ProjectFilterOverrides = {
  addGenre?: string | null;
  removeGenre?: string | null;
  replaceGenres?: string[] | null;
  type?: string | null;
  page?: number | null;
};

function buildProjectsHref(searchParams: URLSearchParams, overrides: ProjectFilterOverrides = {}) {
  const next = new URLSearchParams(searchParams);

  if ('replaceGenres' in overrides) {
    next.delete('genre');
    for (const genre of overrides.replaceGenres ?? []) {
      next.append('genre', genre);
    }
  } else {
    if (overrides.removeGenre) {
      const genres = next.getAll('genre').filter((genre) => genre !== overrides.removeGenre);
      next.delete('genre');
      for (const genre of genres) next.append('genre', genre);
    }

    if (overrides.addGenre) {
      const genres = next.getAll('genre');
      if (!genres.includes(overrides.addGenre)) {
        next.append('genre', overrides.addGenre);
      }
    }
  }

  if ('type' in overrides) {
    if (overrides.type) next.set('type', overrides.type);
    else next.delete('type');
  }

  if ('page' in overrides) {
    if (overrides.page && overrides.page > 1) next.set('page', String(overrides.page));
    else next.delete('page');
  }

  return `/user/project?${next.toString()}`;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const genreFilter = Array.from(new Set(url.searchParams.getAll('genre').filter(Boolean))).slice(0, 3);
  const typeFilter = url.searchParams.get('type') || '';

  const where = {
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(genreFilter.length > 0
      ? {
          project_projectgenre: {
            some: {
              project_genre: {
                genre_name: { in: genreFilter },
              },
            },
          },
        }
      : {}),
  };

  const [total, availableGenres, availableTypes] = await Promise.all([
    prisma.user_profile_project.count({ where }),
    prisma.project_genre.findMany({
      select: { genre_name: true },
      orderBy: { genre_name: 'asc' },
    }),
    prisma.user_profile_project.findMany({
      distinct: ['type'],
      where: { type: { not: '' } },
      select: { type: true },
      orderBy: { type: 'asc' },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const projects = await prisma.user_profile_project.findMany({
    skip,
    take: PAGE_SIZE,
    where,
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
  });

  const mappedProjects = projects.map((project) => ({
    id: project.id,
    userId: project.user_profile?.user_id ?? 0,
    title: project.plot_title,
    synopsis: project.synopsis,
    type: project.type,
    image: project.image ?? null,
    genres: (project.project_projectgenre.map((g) => g.project_genre?.genre_name).filter(Boolean) as string[]),
    tags: (project.project_projecttag.map((t) => t.project_tag?.tag_name).filter(Boolean) as string[]),
  }));

  return {
    projects: mappedProjects,
    total,
    page: currentPage,
    availableGenres: availableGenres.map((genre) => genre.genre_name),
    availableTypes: availableTypes.map((project) => project.type),
  } as const;
}

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({
  id,
  userId,
  title,
  synopsis,
  type,
  image = null,
  genres = [],
  tags = [],
  searchParams,
}: {
  id: number;
  userId: number;
  title: string;
  synopsis: string;
  type: string;
  image?: string | null;
  genres?: string[];
  tags?: string[];
  searchParams: URLSearchParams;
}) {
  const detailHref = `/user/${userId}/profile/project/${id}/about`;

  return (
    <article className="flex flex-col gap-4 px-5 py-5 border border-gray-200 rounded-sm w-full hover:border-yo-orange transition-colors">
      <Link to={detailHref} className="flex items-start gap-4 w-full">
        <div className="flex-shrink-0 w-28 h-36 border border-yo-orange rounded-sm overflow-hidden">
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
        </div>

        <div className="flex-shrink-0 w-5 h-5 text-yo-orange flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-full h-full">
            <path d="M7.5 4L13.5 10L7.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>

      <div className="flex flex-wrap gap-2">
        <Link
          to={buildProjectsHref(searchParams, { type, page: null })}
          className="px-2.5 py-1 bg-yo-orange/10 text-[#231f20] text-xs rounded-sm whitespace-nowrap hover:bg-yo-orange hover:text-white transition-colors"
        >
          {type}
        </Link>
        {genres.map((genre) => (
          <Link
            key={genre}
            to={searchParams.getAll('genre').includes(genre)
              ? buildProjectsHref(searchParams, { removeGenre: genre, page: null })
              : buildProjectsHref(searchParams, { addGenre: genre, page: null })}
            className="px-2.5 py-1 bg-gray-100 text-[#231f20] text-xs rounded-sm whitespace-nowrap hover:bg-yo-orange hover:text-white transition-colors"
          >
            {genre}
          </Link>
        ))}
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 bg-yo-orange/5 text-[#231f20] text-xs rounded-sm whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total }: { page: number; total: number }) {
  const [searchParams] = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  function pageLink(p: number) {
    return buildProjectsHref(searchParams, { page: p });
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
  const { projects, total, page, availableGenres, availableTypes } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const selectedGenres = searchParams.getAll('genre').filter(Boolean);
  const selectedType = searchParams.get('type') || '';
  const [genreOpen, setGenreOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const genreMenuRef = useRef<HTMLDivElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const genreInputRef = useRef<HTMLInputElement>(null);
  const typeInputRef = useRef<HTMLInputElement>(null);

  const filteredGenres = availableGenres.filter((genre) =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );
  const filteredTypes = availableTypes.filter((type) =>
    type.toLowerCase().includes(typeSearch.toLowerCase())
  );

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as Node;
      if (genreMenuRef.current && !genreMenuRef.current.contains(target)) {
        setGenreOpen(false);
      }
      if (typeMenuRef.current && !typeMenuRef.current.contains(target)) {
        setTypeOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  useEffect(() => {
    if (typeOpen) {
      typeInputRef.current?.focus();
    }
  }, [typeOpen]);

  useEffect(() => {
    if (genreOpen) {
      genreInputRef.current?.focus();
    }
  }, [genreOpen]);

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
          <section className="flex flex-col gap-4 rounded-sm border border-gray-200 p-4 md:p-5 bg-white">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-[#231f20] text-lg font-semibold">Filtreler</h2>
                {(selectedGenres.length > 0 || selectedType) && (
                  <Link
                    to="/user/project"
                    className="px-3 py-1 rounded-sm border border-gray-300 text-[#231f20] hover:border-yo-orange hover:text-yo-orange transition-colors text-sm"
                  >
                    Temizle
                  </Link>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div ref={typeMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setTypeOpen((value) => !value);
                        setGenreOpen(false);
                      }}
                      className={`min-w-[160px] flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-sm border transition-colors ${
                        selectedType
                          ? 'bg-yo-orange border-yo-orange text-white'
                          : 'border-gray-300 text-[#231f20] hover:border-yo-orange hover:text-yo-orange'
                      }`}
                    >
                      <span>{selectedType || 'Tür'}</span>
                      <svg width="14" height="9" viewBox="0 0 14 9" fill="none" className={`transition-transform ${typeOpen ? 'rotate-180' : ''}`}>
                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>

                    {typeOpen && (
                      <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-sm border border-gray-200 bg-white shadow-md">
                        <div className="border-b border-gray-100 p-2">
                          <input
                            ref={typeInputRef}
                            type="text"
                            value={typeSearch}
                            onChange={(event) => setTypeSearch(event.target.value)}
                            placeholder="Ara"
                            className="w-full rounded-sm border border-gray-200 px-2 py-1 text-sm text-[#231f20] outline-none focus:border-yo-orange"
                          />
                        </div>
                        <Link
                          to={buildProjectsHref(searchParams, { type: null, page: null })}
                          onClick={() => {
                            setTypeOpen(false);
                            setTypeSearch('');
                          }}
                          className={`block px-3 py-2 text-sm hover:bg-orange-50 hover:text-yo-orange ${!selectedType ? 'bg-orange-50 text-yo-orange font-medium' : 'text-[#231f20]'}`}
                        >
                          Tümü
                        </Link>
                        {filteredTypes.map((type) => (
                          <Link
                            key={type}
                            to={buildProjectsHref(searchParams, { type, page: null })}
                            onClick={() => {
                              setTypeOpen(false);
                              setTypeSearch('');
                            }}
                            className={`block px-3 py-2 text-sm hover:bg-orange-50 hover:text-yo-orange ${selectedType === type ? 'bg-orange-50 text-yo-orange font-medium' : 'text-[#231f20]'}`}
                          >
                            {type}
                          </Link>
                        ))}
                        {filteredTypes.length === 0 && (
                          <span className="block px-3 py-2 text-sm text-gray-400">Sonuç yok</span>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedType && (
                    <Link
                      to={buildProjectsHref(searchParams, { type: null, page: null })}
                      className="px-3 py-2 text-sm rounded-sm border border-yo-orange text-yo-orange hover:bg-yo-orange hover:text-white transition-colors"
                    >
                      {selectedType} ×
                    </Link>
                  )}
                </div>

                <div className="flex items-start gap-2 flex-wrap">
                  <div ref={genreMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setGenreOpen((value) => !value);
                        setTypeOpen(false);
                      }}
                      className="min-w-[160px] flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-sm border border-gray-300 text-[#231f20] hover:border-yo-orange hover:text-yo-orange transition-colors"
                    >
                      <span>Türler</span>
                      <svg width="14" height="9" viewBox="0 0 14 9" fill="none" className={`transition-transform ${genreOpen ? 'rotate-180' : ''}`}>
                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>

                    {genreOpen && (
                      <div className="absolute left-0 top-full z-20 mt-1 min-w-[200px] overflow-hidden rounded-sm border border-gray-200 bg-white shadow-md">
                        <div className="border-b border-gray-100 p-2">
                          <input
                            ref={genreInputRef}
                            type="text"
                            value={genreSearch}
                            onChange={(event) => setGenreSearch(event.target.value)}
                            placeholder="Ara"
                            className="w-full rounded-sm border border-gray-200 px-2 py-1 text-sm text-[#231f20] outline-none focus:border-yo-orange"
                          />
                        </div>
                        {filteredGenres.map((genre) => {
                          const isSelected = selectedGenres.includes(genre);
                          const canSelectMore = selectedGenres.length < 3;
                          const href = isSelected
                            ? buildProjectsHref(searchParams, { removeGenre: genre, page: null })
                            : canSelectMore
                              ? buildProjectsHref(searchParams, { addGenre: genre, page: null })
                              : null;

                          if (!href) {
                            return (
                              <span
                                key={genre}
                                className="block cursor-not-allowed px-3 py-2 text-sm text-gray-300"
                                aria-disabled="true"
                              >
                                {genre}
                              </span>
                            );
                          }

                          return (
                            <Link
                              key={genre}
                              to={href}
                              onClick={() => {
                                setGenreOpen(false);
                                setGenreSearch('');
                              }}
                              className={`block px-3 py-2 text-sm hover:bg-orange-50 hover:text-yo-orange ${isSelected ? 'bg-orange-50 text-yo-orange font-medium' : 'text-[#231f20]'}`}
                            >
                              {genre}
                            </Link>
                          );
                        })}
                        {filteredGenres.length === 0 && (
                          <span className="block px-3 py-2 text-sm text-gray-400">Sonuç yok</span>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedGenres.map((genre) => (
                    <Link
                      key={genre}
                      to={buildProjectsHref(searchParams, { removeGenre: genre, page: null })}
                      className="px-3 py-2 text-sm rounded-sm border border-gray-900 bg-gray-900 text-white hover:bg-white hover:text-gray-900 transition-colors"
                    >
                      {genre} ×
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </section>

          <div className="flex flex-col gap-3">
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                id={project.id}
                userId={project.userId}
                title={project.title}
                synopsis={project.synopsis}
                type={project.type}
                image={project.image}
                genres={project.genres}
                tags={project.tags}
                searchParams={searchParams}
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
