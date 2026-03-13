import { useLoaderData, useSearchParams, Link } from 'react-router';
import { Footer } from '~/components/Footer';
import { prisma } from '~/.server/prisma';
import type { Route } from './+types/route';

const PAGE_SIZE = 10;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [profiles, total] = await Promise.all([
    prisma.user_profile.findMany({
      skip,
      take: PAGE_SIZE,
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    }),
    prisma.user_profile.count(),
  ]);

  const mappedProfiles = profiles.map((profile) => ({
    id: profile.id,
    userId: profile.user_id,
    name: profile.name,
    currentTitle: profile.current_title,
    about: profile.about,
    image: profile.image ?? null,
  }));

  return {
    profiles: mappedProfiles,
    total,
    page,
  } as const;
}

// ─── Profile Row ──────────────────────────────────────────────────────────────
function ProfileRow({
  userId,
  name,
  currentTitle,
  about,
  image,
}: {
  userId: number;
  name: string;
  currentTitle: string | null;
  about: string | null;
  image: string | null | undefined;
}) {
  return (
    <Link
      to={`/user/${userId}/profile`}
      className="flex items-center gap-4 px-5 py-5 border border-gray-200 rounded-sm w-full hover:border-yo-orange transition-colors"
    >
      <div className="flex-shrink-0 w-12 h-12">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-[#231f20]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[#231f20] text-base font-semibold leading-tight truncate">
          {name}
        </h3>
        {currentTitle && (
          <p className="text-[#666] text-sm leading-tight truncate mt-1">
            {currentTitle}
          </p>
        )}
        {about && (
          <p className="text-[#999] text-sm leading-tight truncate mt-1 line-clamp-1">
            {about}
          </p>
        )}
      </div>

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
    return `/user/profile?${next.toString()}`;
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
export default function WritersRoute() {
  const { profiles, total, page } = useLoaderData<typeof loader>();

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
            {profiles.map((profile) => (
              <ProfileRow
                key={profile.id}
                userId={profile.userId}
                name={profile.name}
                currentTitle={profile.currentTitle}
                about={profile.about}
                image={profile.image}
              />
            ))}
            {profiles.length === 0 && (
              <p className="text-center text-gray-500 py-10">Yazar profili bulunamadı.</p>
            )}
          </div>
          <Pagination page={page} total={total} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
