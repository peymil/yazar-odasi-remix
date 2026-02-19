import { useEffect, useRef, useState } from 'react';
import { Link, useFetcher, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs, ShouldRevalidateFunction } from 'react-router';
import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';
import { BookmarkIcon } from '~/components/icons/BookmarkIcon';
import { Footer } from '~/components/Footer';

const PAGE_SIZE = 10;

// Don't revalidate when bookmark API actions run — keeps accumulated scroll items intact
export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction, defaultShouldRevalidate }) => {
  if (formAction?.startsWith('/api/')) return false;
  return defaultShouldRevalidate;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const offset = parseInt(url.searchParams.get('cursor') || '0');

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const results = await prisma.competition.findMany({
    where,
    take: PAGE_SIZE + 1,
    skip: offset,
    orderBy: [{ end_date: 'asc' }],
    include: {
      company: {
        include: { company_profile: true },
      },
    },
  });

  const hasMore = results.length > PAGE_SIZE;
  const items = hasMore ? results.slice(0, PAGE_SIZE) : results;
  const nextCursor = hasMore ? String(offset + PAGE_SIZE) : null;

  const session = await getSessionFromRequest(request);
  const userId = session?.user?.id ?? null;

  let bookmarkedIds = new Set<number>();
  let submittedIds = new Set<number>();

  if (userId) {
    const [bookmarks, submissions] = await Promise.all([
      prisma.competition_bookmark.findMany({
        where: { user_id: userId },
        select: { competition_id: true },
      }),
      prisma.competition_delivery.findMany({
        where: { user_id: userId },
        select: { competition_id: true },
      }),
    ]);
    bookmarkedIds = new Set(bookmarks.map((b) => b.competition_id));
    submittedIds = new Set(submissions.map((s) => s.competition_id));
  }

  return {
    competitions: items.map((c) => ({
      id: c.id,
      title: c.title,
      companyName: c.company?.company_profile[0]?.name ?? null,
      endDate: c.end_date ? c.end_date.toISOString() : null,
      contentType: c.content_type ?? null,
      isBookmarked: bookmarkedIds.has(c.id),
      isSubmitted: submittedIds.has(c.id),
    })),
    nextCursor,
    userId,
  };
}

type CompetitionItem = {
  id: number;
  title: string;
  companyName: string | null;
  endDate: string | null;
  contentType: string | null;
  isBookmarked: boolean;
  isSubmitted: boolean;
};

// ─── Competition Row ─────────────────────────────────────────────────────────
function CompetitionRow({
  item,
  userId,
}: {
  item: CompetitionItem;
  userId: number | null;
}) {
  const fetcher = useFetcher();
  const optimisticBookmarked =
    fetcher.state !== 'idle'
      ? fetcher.formData?.get('action') === 'add'
      : item.isBookmarked;

  const formattedDate = item.endDate
    ? new Date(item.endDate).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Süresiz';

  return (
    <div className="flex items-center gap-4 px-5 py-5 border border-gray-200 rounded-sm w-full">
      {userId ? (
        <fetcher.Form method="post" action="/api/competition/bookmark">
          <input type="hidden" name="competitionId" value={item.id} />
          <input type="hidden" name="action" value={optimisticBookmarked ? 'remove' : 'add'} />
          <button type="submit" className="flex-shrink-0 w-5 h-6">
            <BookmarkIcon className="w-full h-full" filled={optimisticBookmarked} />
          </button>
        </fetcher.Form>
      ) : (
        <Link to="/auth/sign-in" className="flex-shrink-0 w-5 h-6">
          <BookmarkIcon className="w-full h-full" filled={false} />
        </Link>
      )}

      <span className="w-28 flex-shrink-0 text-[#231f20] text-base leading-tight">
        {item.companyName ?? '—'}
      </span>

      <span className="flex-1 text-[#231f20] text-base leading-tight min-w-0">
        {item.title}
      </span>

      <span className="w-28 flex-shrink-0 text-[#231f20] text-base text-center">
        {formattedDate}
      </span>

      <span className="w-24 flex-shrink-0 text-[#231f20] text-base text-center">
        {item.contentType ?? '—'}
      </span>

      {item.isSubmitted ? (
        <span className="flex-shrink-0 px-4 py-2 bg-yo-purple text-white font-primary font-semibold text-[10px] rounded-sm min-w-[110px] text-center">
          başvuru yapıldı
        </span>
      ) : (
        <Link
          to={`/competition/${item.id}`}
          className="flex-shrink-0 px-4 py-2 bg-yo-orange text-white font-primary font-semibold text-[10px] rounded-sm min-w-[80px] text-center"
        >
          incele
        </Link>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompetitionAllRoute() {
  const initialData = useLoaderData<typeof loader>();

  // Initialize items from loader data; further items come from infinite scroll fetcher
  const [items, setItems] = useState<CompetitionItem[]>(initialData.competitions);
  const [nextCursor, setNextCursor] = useState<string | null>(initialData.nextCursor);

  const fetcher = useFetcher<typeof loader>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Append new items when fetcher returns data
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setItems((prev) => [...prev, ...fetcher.data!.competitions]);
      setNextCursor(fetcher.data.nextCursor);
      loadingRef.current = false;
    }
  }, [fetcher.state, fetcher.data]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && nextCursor && !loadingRef.current) {
          loadingRef.current = true;
          fetcher.load(`/competition/all?cursor=${nextCursor}`);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, fetcher]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-6">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/competition?tab=kesfet"
            className="text-yo-orange text-base flex items-center gap-1"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="#FF6D2B" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Geri
          </Link>
          <h1 className="font-primary font-semibold text-2xl text-[#231f20]">
            Tüm Yarışmalar
          </h1>
        </div>

        {/* Filters row */}
        <div className="flex items-center justify-between mb-4">
          <button className="flex items-center gap-2 border border-[#231f20] px-4 py-2 text-[#231f20] text-base rounded-sm">
            <span>içerik tipi</span>
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 1L7 7L13 1" stroke="#231f20" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button className="flex items-center gap-2 text-[#231f20] text-base">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <line x1="0" y1="2" x2="18" y2="2" stroke="#231f20" strokeWidth="1.5" />
              <line x1="3" y1="7" x2="18" y2="7" stroke="#231f20" strokeWidth="1.5" />
              <line x1="6" y1="12" x2="18" y2="12" stroke="#231f20" strokeWidth="1.5" />
            </svg>
            <span>başvuru tarihi</span>
          </button>
        </div>

        {/* Competition list */}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <CompetitionRow
              key={item.id}
              item={item}
              userId={initialData.userId}
            />
          ))}

          {items.length === 0 && (
            <p className="text-center text-gray-500 py-10">Yarışma bulunamadı.</p>
          )}
        </div>

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-10 mt-4">
          {fetcher.state === 'loading' && (
            <div className="flex justify-center py-4">
              <svg
                className="animate-spin w-6 h-6 text-yo-orange"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
          {!nextCursor && items.length > 0 && (
            <p className="text-center text-gray-400 text-sm py-4">
              Tüm yarışmalar yüklendi.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
