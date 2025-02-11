import { type LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { prisma } from '~/.server/prisma';
import { Button } from '~/components/ui/button';
import { validateSessionToken } from '~/.server/auth';
import { Route } from './+types/route';

export async function loader({ request, params }: Route.ActionArgs) {
  console.log('params', params);
  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id!) },
    include: {
      company: {
        include: {
          company_profile: true,
        },
      },
      deliveries: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!competition) {
    throw new Response('Not Found', { status: 404 });
  }

  const session = await validateSessionToken(
    (await request.headers.get('Cookie')?.split('auth-token=')[1]) || ''
  );

  const isCompanyUser = session?.user?.company_user.some(
    (cu) => cu.company_id === competition.company_id
  );

  return { competition, isCompanyUser };
}

export default function CompetitionDetailsRoute() {
  const { competition, isCompanyUser } = useLoaderData<typeof loader>();
  const companyProfile = competition.company.company_profile[0];
  const isActive = new Date(competition.end_date) >= new Date();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link to="/competition" className="text-yo-orange hover:underline">
          ← Back to Competitions
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{competition.title}</h1>
            <div className="text-yo-text-secondary">
              by {companyProfile?.name || competition.company.name}
            </div>
          </div>
          {isActive && !isCompanyUser && (
            <Link to={`/competition/${competition.id}/submit`}>
              <Button className="bg-yo-orange hover:bg-yo-orange/90">
                Submit Entry
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <div className="text-yo-text-secondary">Deadline</div>
                <div>{new Date(competition.end_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-yo-text-secondary">Status</div>
                <div className={isActive ? 'text-green-600' : 'text-red-600'}>
                  {isActive ? 'Active' : 'Closed'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-yo-text-secondary whitespace-pre-wrap">
              {competition.description}
            </p>
          </div>
        </div>

        {isCompanyUser && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Submissions ({competition.deliveries.length})
            </h2>
            <div className="space-y-4">
              {competition.deliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{delivery.user.email}</div>
                      <div className="text-yo-text-secondary">
                        Submitted on{' '}
                        {new Date(delivery.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-x-2">
                      {delivery.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yo-orange hover:underline"
                        >
                          Link {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
