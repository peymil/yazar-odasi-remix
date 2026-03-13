import { prisma } from '~/.server/prisma';
import { profileSearch, projectSearch, workSearch, competitionSearch } from '@prisma/client/sql';
import { Route } from './+types/api.search';

interface SearchResults {
  users: any[];
  projects: any[];
  works: any[];
  competitions: any[];
  totals: {
    users: number;
    projects: number;
    works: number;
    competitions: number;
  };
}

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;
const TIMEOUT_MS = 10000; // 10 second timeout for entire search

function createTimeoutPromise<T>(ms: number): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Search timeout')), ms)
  );
}

async function executeSearchWithTimeout<T>(fn: () => Promise<T[]>, timeoutMs: number): Promise<T[]> {
  try {
    return await Promise.race([
      fn(),
      createTimeoutPromise(timeoutMs),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === 'Search timeout') {
      console.warn('Search query timed out');
      return [];
    }
    // Log but don't throw - return empty results on any error
    console.error('Search error:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

export async function loader({ request }: Route.LoaderArgs): Promise<SearchResults> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'all';
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(
    limitParam ? parseInt(limitParam) : DEFAULT_LIMIT,
    MAX_LIMIT
  );
  const offsetParam = url.searchParams.get('offset');
  const offset = Math.max(0, offsetParam ? parseInt(offsetParam) : 0);

  const results: SearchResults = {
    users: [],
    projects: [],
    works: [],
    competitions: [],
    totals: {
      users: 0,
      projects: 0,
      works: 0,
      competitions: 0,
    },
  };

  // Return empty results if query is too short
  if (!query || query.trim().length < 2) {
    return results;
  }

  const trimmedQuery = query.trim();

  try {
    // Execute all searches in parallel with timeout protection
    // Each search is wrapped to not fail the entire request
    const [userResults, projectResults, workResults, competitionResults] = await Promise.all([
      (type === 'all' || type === 'users')
        ? executeSearchWithTimeout(
            () => prisma.$queryRawTyped(profileSearch(trimmedQuery, limit, offset)),
            TIMEOUT_MS
          )
        : Promise.resolve([]),
      (type === 'all' || type === 'projects')
        ? executeSearchWithTimeout(
            () => prisma.$queryRawTyped(projectSearch(trimmedQuery, limit, offset)),
            TIMEOUT_MS
          )
        : Promise.resolve([]),
      (type === 'all' || type === 'works')
        ? executeSearchWithTimeout(
            () => prisma.$queryRawTyped(workSearch(trimmedQuery, limit, offset)),
            TIMEOUT_MS
          )
        : Promise.resolve([]),
      (type === 'all' || type === 'competitions')
        ? executeSearchWithTimeout(
            () => prisma.$queryRawTyped(competitionSearch(trimmedQuery, limit, offset)),
            TIMEOUT_MS
          )
        : Promise.resolve([]),
    ]);

    // Process results
    if (userResults.length > 0) {
      results.totals.users = Number(userResults[0].total_count) || 0;
      results.users = userResults;
    }

    if (projectResults.length > 0) {
      results.totals.projects = Number(projectResults[0].total_count) || 0;
      results.projects = projectResults;
    }

    if (workResults.length > 0) {
      results.totals.works = Number(workResults[0].total_count) || 0;
      results.works = workResults;
    }

    if (competitionResults.length > 0) {
      results.totals.competitions = Number(competitionResults[0].total_count) || 0;
      results.competitions = competitionResults;
    }
  } catch (error) {
    console.error('Overall search error:', error);
    // Return partial results that have been gathered so far
  }

  return results;
}
