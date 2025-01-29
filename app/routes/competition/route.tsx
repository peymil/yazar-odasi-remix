import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { prisma } from "~/.server/prisma";
import type { competition, company_profile } from "@prisma/client";
import { competitionSearch } from "@prisma/client/sql";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Pagination } from "~/components/ui/pagination";
import { getSessionFromRequest } from "~/.server/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q") || "";
  const limitParam = url.searchParams.get("limit");
  const takeParam = url.searchParams.get("take");
  const limit = limitParam ? parseInt(limitParam) : 50;
  const take = takeParam ? parseInt(takeParam) : 0;

  const searchPattern = `%${searchQuery}%`;
  const results = await prisma.$queryRawTyped(
    competitionSearch(searchPattern, limit, take)
  );

  const total = results.length > 0 ? Number(results[0].total_count) : 0;

  const session = await getSessionFromRequest(request);
  const user = session?.user 
  return { competitions: results, total, user };
}

export default function CompetitionsRoute() {
  const { competitions, total, user } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const limitParam = searchParams.get("limit");
  const takeParam = searchParams.get("take");
  const limit = limitParam ? parseInt(limitParam) : 50;
  const take = takeParam ? parseInt(takeParam) : 0;
  const searchQuery = searchParams.get("q");
  const hasSearchQuery = Boolean(searchQuery && searchQuery.length >= 2);

  const hasMore = competitions.length === limit;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Competitions</h1>
      
      <div className="flex items-center gap-4 mb-8">
        <form className="flex-1">
          <Input
            type="search"
            name="q"
            defaultValue={searchQuery || ""}
            placeholder="Search competitions..."
            className="w-full"
          />
        </form>
        {(user?.company_user && user.company_user.length > 0) && (
          <Link to="/competition/new">
            <Button>Yarışma Oluştur</Button>
          </Link>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-600">
        {total} competition{total !== 1 ? 's' : ''}
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {competitions.map((competition) => (
          <div key={competition.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {competition.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {competition.description}
                </p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Company: {competition.company_name}</span>
                  <span>•</span>
                  <span>
                    Deadline:{" "}
                    {new Date(competition.end_date).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Prize: {competition.prize}</span>
                  <span>•</span>
                  <span>{competition.delivery_count?.toString()} submissions</span>
                </div>
              </div>
              <Link to={`/competition/${competition.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </div>
          </div>
        ))}

        {competitions.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No competitions found
          </div>
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
