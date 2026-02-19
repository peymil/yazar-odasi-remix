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
    const deliveries = await prisma.competition_delivery.findMany({
      where: { user_id: userId },
      include: {
        competition: {
          include: { company: { include: { company_profile: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
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
    const bookmarks = await prisma.competition_bookmark.findMany({
      where: { user_id: userId },
      include: {
        competition: {
          include: { company: { include: { company_profile: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    const competitionIds = bookmarks.map((b) => b.competition_id);
    const submissions = competitionIds.length
      ? await prisma.competition_delivery.findMany({
          where: { user_id: userId, competition_id: { in: competitionIds } },
          select: { competition_id: true },
        })
      : [];
    const submittedSet = new Set(submissions.map((s) => s.competition_id));
    return {
      tab: 'kaydedilenler' as const,
      bookmarks: bookmarks.map((b) => ({
        id: b.competition.id,
        title: b.competition.title,
        companyName: b.competition.company.company_profile[0]?.name ?? null,
        endDate: b.competition.end_date.toISOString(),
        contentType: b.competition.content_type ?? null,
        isSubmitted: submittedSet.has(b.competition_id),
      })),
      userId,
    };
  }

  // default: kesfet
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [competitions, bookmarks, submissions] = await Promise.all([
    prisma.competition.findMany({
      skip,
      take: PAGE_SIZE + 1,
      include: { company: { include: { company_profile: true } } },
      orderBy: [{ end_date: 'asc' }],
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
  ]);

  const bookmarkedSet = new Set(bookmarks.map((b) => b.competition_id));
  const submittedSet = new Set(submissions.map((s) => s.competition_id));

  const hasMore = competitions.length > PAGE_SIZE;
  const items = competitions.slice(0, PAGE_SIZE);

  return {
    tab: 'kesfet' as const,
    competitions: items.map((c) => ({
      id: c.id,
      title: c.title,
      companyName: c.company.company_profile[0]?.name ?? null,
      endDate: c.end_date.toISOString(),
      contentType: c.content_type ?? null,
      isBookmarked: bookmarkedSet.has(c.id),
      isSubmitted: submittedSet.has(c.id),
    })),
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
}: {
  showContentType?: boolean;
  showStatusFilter?: boolean;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div>
        {showContentType && (
          <button className="flex items-center gap-2 border border-[#231f20] px-4 py-2 text-[#231f20] text-base rounded-sm">
            <span>içerik tipi</span>
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 1L7 7L13 1" stroke="#231f20" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

      </div>
      <button className="flex items-center gap-2 text-[#231f20] text-base">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <line x1="0" y1="2" x2="18" y2="2" stroke="#231f20" strokeWidth="1.5" />
          <line x1="3" y1="7" x2="18" y2="7" stroke="#231f20" strokeWidth="1.5" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="#231f20" strokeWidth="1.5" />
        </svg>
        <span>başvuru tarihi</span>
      </button>
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
  const optimisticBookmarked =
    fetcher.state !== 'idle'
      ? fetcher.formData?.get('action') === 'add'
      : isBookmarked;

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
        <fetcher.Form method="post" action="/api/competition/bookmark">
          <input type="hidden" name="competitionId" value={id} />
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
        <span className="flex-shrink-0 px-4 py-2 bg-yo-purple text-white font-primary font-semibold text-[10px] rounded-sm min-w-[110px] text-center">
          başvuru yapıldı
        </span>
      ) : (
        <Link
          to={`/competition/${id}`}
          className="flex-shrink-0 px-4 py-2 bg-yo-orange text-white font-primary font-semibold text-[10px] rounded-sm min-w-[80px] text-center"
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
        to={`/competition/${competitionId}`}
        className="flex-shrink-0 px-4 py-2 bg-yo-orange text-white font-primary font-semibold text-[10px] rounded-sm min-w-[110px] text-center"
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
          fetcher.load(`/competition?tab=kesfet&page=${pageRef.current + 1}`);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, fetcher]);

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
            <FiltersBar showContentType />
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
            <FiltersBar showStatusFilter />
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
            <FiltersBar showContentType />
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
