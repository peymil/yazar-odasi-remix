import { redirect } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';
import type { Route } from './+types/route';

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) return redirect('/auth/sign-in');

  const deliveryId = parseInt(params.deliveryId!);
  const competitionId = parseInt(params.id!);

  if (isNaN(deliveryId) || isNaN(competitionId)) {
    throw new Response('Not Found', { status: 404 });
  }

  const delivery = await prisma.competition_delivery.findFirst({
    where: {
      id: deliveryId,
      competition_id: competitionId,
      user_id: session.user.id,
    },
    include: {
      competition: {
        include: {
          company: { include: { company_profile: true } },
        },
      },
    },
  });

  if (!delivery) {
    throw new Response('Not Found', { status: 404 });
  }

  return {
    delivery: {
      id: delivery.id,
      status: delivery.status,
      docs: delivery.docs,
      createdAt: delivery.created_at.toISOString(),
      competition: {
        id: delivery.competition.id,
        title: delivery.competition.title,
        endDate: delivery.competition.end_date.toISOString(),
        companyName: delivery.competition.company.company_profile[0]?.name ?? null,
      },
    },
  };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Değerlendiriliyor',
  SUBMITTED: 'Başvuru Gönderildi',
  REJECTED: 'Reddedildi',
  ACCEPTED: 'Kabul Edildi',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-gray-600 bg-gray-100',
  SUBMITTED: 'text-blue-600 bg-blue-50',
  REJECTED: 'text-red-600 bg-red-50',
  ACCEPTED: 'text-green-600 bg-green-50',
};

export default function DeliveryDetailRoute() {
  const { delivery } = useLoaderData<typeof loader>();
  const statusLabel = STATUS_LABEL[delivery.status] ?? delivery.status;
  const statusColor = STATUS_COLOR[delivery.status] ?? 'text-gray-600 bg-gray-100';

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          to="/competition?tab=basvurularim"
          className="text-yo-orange hover:underline text-sm"
        >
          ← Başvurularıma Dön
        </Link>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#231f20]">
            {delivery.competition.title}
          </h1>
          {delivery.competition.companyName && (
            <p className="text-yo-text-secondary text-sm">
              {delivery.competition.companyName} tarafından
            </p>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            Başvuru Durumu
          </span>
          <span
            className={`inline-flex self-start px-3 py-1 rounded-sm text-sm font-semibold ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Başvuru Tarihi
            </span>
            <span className="text-[#231f20] text-sm">
              {new Date(delivery.createdAt).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Son Başvuru Tarihi
            </span>
            <span className="text-[#231f20] text-sm">
              {new Date(delivery.competition.endDate).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Submitted documents */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            Gönderilen Dosyalar / Linkler
          </span>
          {delivery.docs.length === 0 ? (
            <p className="text-gray-400 text-sm">Dosya bulunamadı.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {delivery.docs.map((doc, i) => (
                <li key={i}>
                  <a
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yo-orange hover:underline text-sm break-all"
                  >
                    {doc}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Link to competition */}
        <div className="pt-2 border-t border-gray-100">
          <Link
            to={`/competition/${delivery.competition.id}`}
            className="text-sm text-yo-orange hover:underline"
          >
            Yarışma detaylarını görüntüle →
          </Link>
        </div>
      </div>
    </div>
  );
}
