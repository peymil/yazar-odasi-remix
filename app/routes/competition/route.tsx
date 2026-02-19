import { redirect } from 'react-router';
import { Link, useFetcher, useLoaderData, useSearchParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import type { ShouldRevalidateFunction } from 'react-router';
import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';
import { BookmarkIcon } from '~/components/icons/BookmarkIcon';
import { Footer } from '~/components/Footer';
import type { Route } from './+types/route';
import type { competition_delivery_status } from '@prisma/client';

const PAGE_SIZE = 10;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  defaultShouldRevalidate,
}) => {
  if (formAction?.startsWith('/api/')) return false;
  return defaultShouldRevalidate;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tab = url.searchParams.get('tab') || 'kesfet';

  const session = await getSessionFromRequest(request);
  const userId = session?.user?.id ?? null;

  if (tab === 'basvurularim') {
    if (!userId) return redirect('/auth/sign-in');
    const sort = url.searchParams.get('sort') === 'asc' ? 'asc' : 'desc';
    const deliveries = await prisma.competition_delivery.findMany({
      where: { user_id: userId },
      include: {
        competition: {
          include: { company: { include: { company_profile: true } } },
        },
      },
      orderBy: { created_at: sort },
    });
    return {
      tab: 'basvurularim' as const,
      deliveries: deliveries.map((d) => ({
        deliveryId: d.id,
        competitionId: d.competition_id,
        title: d.competition.title,
        companyName: d.competition.company.company_profile[0]?.name ?? null,
        status: d.status,
      })),
      userId,
    };
  }

  if (tab === 'kaydedilenler') {
    if (!userId) return redirect('/auth/sign-in');
    const contentTypeFilter = url.searchParams.get('contentType') || '';
    const sort = url.searchParams.get('sort') === 'desc' ? 'desc' : 'asc';

    const [bookmarks, contentTypesRaw] = await Promise.all([
      prisma.competition_bookmark.findMany({
        where: {
          user_id: userId,
          ...(contentTypeFilter
            ? { competition: { content_type: contentTypeFilter } }
            : {}),
        },
        include: {
          competition: {
            include: { company: { include: { company_profile: true } } },
          },
        },
        orderBy: { competition: { end_date: sort } },
      }),
      prisma.competition.findMany({
        where: { content_type: { not: null } },
        select: { content_type: true },
        distinct: ['content_type'],
      }),
    ]);
    const competitionIds = bookmarks.map((b: any) => b.competition_id);
    const submissions = competitionIds.length
      ? await prisma.competition_delivery.findMany({
          where: { user_id: userId, competition_id: { in: competitionIds } },
          select: { competition_id: true },
        })
      : [];
    const submittedSet = new Set(submissions.map((s: any) => s.competition_id));
    return {
      tab: 'kaydedilenler' as const,
      bookmarks: bookmarks.map((b: any) => ({
        id: b.competition.id,
        title: b.competition.title,
        companyName: b.competition.company.company_profile[0]?.name ?? null,
        endDate: b.competition.end_date.toISOString(),
        contentType: b.competition.content_type ?? null,
        isSubmitted: submittedSet.has(b.competition_id),
      })),
      contentTypes: contentTypesRaw.map((c: any) => c.content_type as string),
      userId,
    };
  }

  // default: kesfet
  const contentTypeFilter = url.searchParams.get('contentType') || '';
  const sort = url.searchParams.get('sort') === 'desc' ? 'desc' : 'asc';
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [competitions, bookmarks, submissions, contentTypesRaw] = await Promise.all([
    prisma.competition.findMany({
      skip,
      take: PAGE_SIZE + 1,
      where: contentTypeFilter ? { content_type: contentTypeFilter } : {},
      include: { company: { include: { company_profile: true } } },
      orderBy: [{ end_date: sort }],
    }),
    userId
      ? prisma.competition_bookmark.findMany({
          where: { user_id: userId },
          select: { competition_id: true },
        })
      : ([] as { competition_id: number }[]),
    userId
      ? prisma.competition_delivery.findMany({
          where: { user_id: userId },
          select: { competition_id: true },
        })
      : ([] as { competition_id: number }[]),
    prisma.competition.findMany({
      where: { content_type: { not: null } },
      select: { content_type: true },
      distinct: ['content_type'],
    }),
  ]);

  const bookmarkedSet = new Set(bookmarks.map((b: any) => b.competition_id));
  const submittedSet = new Set(submissions.map((s: any) => s.competition_id));

  const hasMore = competitions.length > PAGE_SIZE;
  const items = competitions.slice(0, PAGE_SIZE);

  return {
    tab: 'kesfet' as const,
    competitions: items.map((c: any) => ({
      id: c.id,
      title: c.title,
      companyName: c.company.company_profile[0]?.name ?? null,
      endDate: c.end_date.toISOString(),
      contentType: c.content_type ?? null,
      isBookmarked: bookmarkedSet.has(c.id),
      isSubmitted: submittedSet.has(c.id),
    })),
    contentTypes: contentTypesRaw.map((c: any) => c.content_type as string),
    hasMore,
    page,
    userId,
  };
}

// ─── Tab Button ──────────────────────────────────────────────────────────────
function TabButton({
  value,
  activeTab,
  children,
}: {
  value: string;
  activeTab: string;
  children: React.ReactNode;
}) {
  const isActive = value === activeTab;
  return (
    <Link
      to={`/competition?tab=${value}`}
      className={`px-5 py-2 font-primary font-semibold text-[15px] border rounded-sm transition-colors whitespace-nowrap ${
        isActive
          ? 'bg-yo-orange text-white border-yo-orange'
          : 'bg-white text-[#231f20] border-[#231f20]'
      }`}
    >
      {children}
    </Link>
  );
}

// ─── Filters Bar ─────────────────────────────────────────────────────────────
function FiltersBar({
  showContentType = false,
  showStatusFilter = false,
  showSort = false,
  contentTypes = [],
}: {
  showContentType?: boolean;
  showStatusFilter?: boolean;
  showSort?: boolean;
  contentTypes?: string[];
}) {
  const [searchParams] = useSearchParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentContentType = searchParams.get('contentType') || '';
  const currentSort = searchParams.get('sort') || 'asc';
  const tab = searchParams.get('tab') || 'kesfet';

  function buildParams(overrides: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    // reset pagination when filter/sort changes
    next.delete('page');
    return next.toString();
  }

  const nextSort = currentSort === 'asc' ? 'desc' : 'asc';

  return (
    <div className="flex items-center justify-between w-full">
      <div className="relative">
        {showContentType && (
          <>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className={`flex items-center gap-2 border px-4 py-2 text-base rounded-sm transition-colors ${
                currentContentType
                  ? 'border-yo-orange text-yo-orange bg-orange-50'
                  : 'border-[#231f20] text-[#231f20]'
              }`}
            >
              <span>{currentContentType || 'içerik tipi'}</span>
              <svg
                width="14"
                height="9"
                viewBox="0 0 14 9"
                fill="none"
                className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-sm shadow-md min-w-[160px]">
                <Link
                  to={`/competition?${buildParams({ tab, contentType: '' })}`}
                  onClick={() => setDropdownOpen(false)}
                  className={`block px-4 py-2 text-sm hover:bg-orange-50 hover:text-yo-orange ${
                    !currentContentType ? 'text-yo-orange font-semibold' : 'text-[#231f20]'
                  }`}
                >
                  Tümü
                </Link>
                {contentTypes.map((ct) => (
                  <Link
                    key={ct}
                    to={`/competition?${buildParams({ tab, contentType: ct })}`}
                    onClick={() => setDropdownOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-orange-50 hover:text-yo-orange ${
                      currentContentType === ct ? 'text-yo-orange font-semibold' : 'text-[#231f20]'
                    }`}
                  >
                    {ct}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showSort && (
        <Link
          to={`/competition?${buildParams({ tab, sort: nextSort })}`}
          className="flex items-center gap-2 text-[#231f20] text-base hover:text-yo-orange transition-colors"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <line x1="0" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="3" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.5" />
            <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>
            başvuru tarihi{' '}
            <span className="text-xs text-gray-400">{currentSort === 'asc' ? '↑' : '↓'}</span>
          </span>
        </Link>
      )}
    </div>
  );
}

// ─── Competition Row (keşfet / kaydedilenler) ────────────────────────────────
function CompetitionRow({
  id,
  title,
  companyName,
  endDate,
  contentType,
  isBookmarked,
  isSubmitted,
  userId,
}: {
  id: number;
  title: string;
  companyName: string | null;
  endDate: Date | string;
  contentType: string | null;
  isBookmarked: boolean;
  isSubmitted: boolean;
  userId: number | null;
}) {
  const fetcher = useFetcher();
  // Local state is the source of truth; synced from prop on initial mount / revalidation
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  // While a request is in-flight, show what we submitted (true optimistic UI)
  const displayed =
    fetcher.state !== 'idle'
      ? fetcher.formData?.get('action') === 'add'
      : bookmarked;

  function toggleBookmark() {
    const next = !displayed;
    setBookmarked(next); // commit immediately so state persists after fetcher goes idle
    fetcher.submit(
      { competitionId: String(id), action: next ? 'add' : 'remove' },
      { method: 'post', action: '/api/competition/bookmark' }
    );
  }

  // Keep in sync if the loader re-runs (e.g. tab switch)
  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const formattedDate = endDate
    ? new Date(endDate).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Süresiz';

  return (
    <div className="flex items-center gap-4 px-5 py-5 border border-gray-200 rounded-sm w-full">
      {userId ? (
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={fetcher.state !== 'idle'}
          className="flex-shrink-0 w-5 h-6"
        >
          <BookmarkIcon className="w-full h-full" filled={displayed} />
        </button>
      ) : (
        <Link to="/auth/sign-in" className="flex-shrink-0 w-5 h-6">
          <BookmarkIcon className="w-full h-full" filled={false} />
        </Link>
      )}

      <span className="w-28 flex-shrink-0 text-[#231f20] text-base leading-tight">
        {companyName ?? '—'}
      </span>

      <span className="flex-1 text-[#231f20] text-base leading-tight min-w-0">
        {title}
      </span>

      <span className="w-28 flex-shrink-0 text-[#231f20] text-base text-center">
        {formattedDate}
      </span>

      <span className="w-24 flex-shrink-0 text-[#231f20] text-base text-center">
        {contentType ?? '—'}
      </span>

      {isSubmitted ? (
        <span className="flex-shrink-0 px-4 py-2 bg-yo-purple text-white font-primary font-semibold text-[10px] rounded-sm w-[110px] text-center">
          başvuru yapıldı
        </span>
      ) : (
        <Link
          to={`/competition/${id}`}
          className="flex-shrink-0 px-4 py-2 bg-yo-orange text-white font-primary font-semibold text-[10px] rounded-sm w-[110px] text-center"
        >
          incele
        </Link>
      )}
    </div>
  );
}

// ─── Submission Row (başvurularım) ───────────────────────────────────────────
type DeliveryStatus = 'PENDING' | 'SUBMITTED' | 'REJECTED' | 'ACCEPTED';

function StatusIcon({ status }: { status: DeliveryStatus }) {
  if (status === 'PENDING') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 w-6 h-6">
        <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="1.5" />
        <path d="M12 6V12L15.5 15.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'SUBMITTED') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 w-6 h-6">
        <path d="M12 2L22 20H2L12 2Z" stroke="#888" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 10V14" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="#888" />
      </svg>
    );
  }
  if (status === 'REJECTED') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 w-6 h-6">
        <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="1.5" />
        <path d="M5.5 5.5L18.5 18.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="#FF6D2B" />
      <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: 'Değerlendiriliyor',
  SUBMITTED: 'Başvuru Gönderildi',
  REJECTED: 'Reddedildi',
  ACCEPTED: 'Kabul Edildi',
};

function SubmissionRow({
  deliveryId,
  competitionId,
  title,
  companyName,
  status,
}: {
  deliveryId: number;
  competitionId: number;
  title: string;
  companyName: string | null;
  status: string;
}) {
  const s = (status as DeliveryStatus) ?? 'SUBMITTED';
  return (
    <div className="flex items-center gap-4 px-5 py-5 border border-gray-200 rounded-sm w-full">
      <StatusIcon status={s} />

      <span className="w-28 flex-shrink-0 text-[#231f20] text-base leading-tight">
        {companyName ?? '—'}
      </span>

      <span className="flex-1 text-[#231f20] text-base leading-tight min-w-0">
        {title}
      </span>

      <span className="w-44 flex-shrink-0 text-[#231f20] text-base">
        {STATUS_LABEL[s]}
      </span>

      <Link
        to={`/competition/${competitionId}/delivery/${deliveryId}`}
        className="flex-shrink-0 px-4 py-2 bg-yo-orange text-white font-primary font-semibold text-[10px] rounded-sm w-[110px] text-center"
      >
        başvuru detayı
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompetitionsRoute() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'kesfet';

  const fetcher = useFetcher<typeof loader>();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [competitions, setCompetitions] = useState(() =>
    data.tab === 'kesfet' ? data.competitions : []
  );
  const [hasMore, setHasMore] = useState(() =>
    data.tab === 'kesfet' ? data.hasMore : false
  );
  const pageRef = useRef(data.tab === 'kesfet' ? data.page : 1);

  // Reset list when initial loader data changes (e.g. tab switch)
  useEffect(() => {
    if (data.tab === 'kesfet') {
      setCompetitions(data.competitions);
      setHasMore(data.hasMore);
      pageRef.current = data.page;
    }
  }, [data]);

  // Append fetcher results
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.tab === 'kesfet') {
      setCompetitions((prev) => [...prev, ...fetcher.data!.competitions]);
      setHasMore((fetcher.data as { hasMore: boolean }).hasMore);
      pageRef.current = (fetcher.data as { page: number }).page;
    }
  }, [fetcher.state, fetcher.data]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          fetcher.state === 'idle'
        ) {
          // Preserve current filter/sort params when loading next page
          const next = new URLSearchParams(searchParams);
          next.set('tab', 'kesfet');
          next.set('page', String(pageRef.current + 1));
          fetcher.load(`/competition?${next.toString()}`);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, fetcher, searchParams]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-6">
        {/* Orange rule – aligned right for keşfet, left for başvurularım */}
        <div className="flex mb-5">
          {tab === 'basvurularim' && <div className="h-0.5 bg-yo-orange w-1/2" />}
          {tab === 'kaydedilenler' && (
            <>
              <div className="w-1/3" />
              <div className="h-0.5 bg-yo-orange w-1/3" />
            </>
          )}
          {tab === 'kesfet' && (
            <>
              <div className="flex-1" />
              <div className="h-0.5 bg-yo-orange w-1/2" />
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          <TabButton value="basvurularim" activeTab={tab}>
            başvurularım
          </TabButton>
          <TabButton value="kaydedilenler" activeTab={tab}>
            kaydedilenler
          </TabButton>
          <TabButton value="kesfet" activeTab={tab}>
            keşfet
          </TabButton>
        </div>

        {/* ── Keşfet ── */}
        {data.tab === 'kesfet' && (
          <div className="flex flex-col gap-4">
            <FiltersBar showContentType showSort contentTypes={data.contentTypes} />
            <div className="flex flex-col gap-3">
              {competitions.map((c) => (
                <CompetitionRow
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  companyName={c.companyName}
                  endDate={c.endDate}
                  contentType={c.contentType}
                  isBookmarked={c.isBookmarked}
                  isSubmitted={c.isSubmitted}
                  userId={data.userId}
                />
              ))}
              {competitions.length === 0 && (
                <p className="text-center text-gray-500 py-10">Yarışma bulunamadı.</p>
              )}
            </div>
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />
            {fetcher.state !== 'idle' && (
              <p className="text-center text-gray-400 py-4 text-sm">Yükleniyor...</p>
            )}
          </div>
        )}

        {/* ── Başvurularım ── */}
        {data.tab === 'basvurularim' && (
          <div className="flex flex-col gap-4">
            <FiltersBar showStatusFilter showSort />
            <div className="flex flex-col gap-3">
              {data.deliveries.map((d) => (
                <SubmissionRow
                  key={d.deliveryId}
                  deliveryId={d.deliveryId}
                  competitionId={d.competitionId}
                  title={d.title}
                  companyName={d.companyName}
                  status={d.status}
                />
              ))}
              {data.deliveries.length === 0 && (
                <p className="text-center text-gray-500 py-10">Henüz başvuru yapmadınız.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Kaydedilenler ── */}
        {data.tab === 'kaydedilenler' && (
          <div className="flex flex-col gap-4">
            <FiltersBar showContentType showSort contentTypes={'contentTypes' in data ? data.contentTypes : []} />
            <div className="flex flex-col gap-3">
              {data.bookmarks.map((b) => (
                <CompetitionRow
                  key={b.id}
                  id={b.id}
                  title={b.title}
                  companyName={b.companyName}
                  endDate={b.endDate}
                  contentType={b.contentType}
                  isBookmarked={true}
                  isSubmitted={b.isSubmitted}
                  userId={data.userId}
                />
              ))}
              {data.bookmarks.length === 0 && (
                <p className="text-center text-gray-500 py-10">
                  Kaydedilmiş yarışma bulunmuyor.{' '}
                  <Link to="/competition?tab=kesfet" className="text-yo-orange underline">
                    Keşfet
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
