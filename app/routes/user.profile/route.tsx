import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { SearchBar } from "~/components/SearchBar";
import { UserProfileItem } from "~/components/UserProfileItem";
import { prisma } from "~/.server/prisma";
import type { user_profile } from "@prisma/client";
import { profileSearch } from "@prisma/client/sql";


export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("q");
    const pageParam = url.searchParams.get("page");
    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    if (!searchQuery || searchQuery.length < 2) {
        return json({ profiles: [], total: 0 });
    }

    const results = await prisma.$queryRawTyped(
        profileSearch(searchQuery, limit, skip)
    )

    const profiles = results.map(row => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        current_title: row.current_title,
        about: row.about,
        contact_email: null,
        background_image: null,
        user: {
            email: row.email,
            image: row.image
        }
    }));

    const total = results.length > 0 ? Number(results[0].total_count) : 0;

    return json({ profiles, total });
}

export default function UserProfileSearchRoute() {
    const { profiles, total } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const currentPage = pageParam ? parseInt(pageParam) : 1;
    const searchQuery = searchParams.get("q");
    const hasSearchQuery = Boolean(searchQuery && searchQuery.length >= 2);

    const totalPages = Math.ceil(total / 50);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Search Writer Profiles</h1>
            
            <SearchBar className="mb-8" />

            {hasSearchQuery && (
                <div className="mb-4 text-sm text-gray-600">
                    Found {total} profile{total !== 1 ? 's' : ''}
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                {profiles.map((profile) => (
                    <UserProfileItem
                        key={profile.id}
                        id={profile.id}
                        name={profile.name}
                        userId={profile.user_id}
                        currentTitle={profile.current_title}
                        about={profile.about}
                        user={profile.user}
                    />
                ))}

                {hasSearchQuery && profiles.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No profiles found
                    </div>
                )}

                {!hasSearchQuery && (
                    <div className="p-4 text-center text-gray-500">
                        Enter at least 2 characters to search
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <a
                            key={pageNum}
                            href={`?${new URLSearchParams({
                                ...Object.fromEntries(searchParams.entries()),
                                page: pageNum.toString(),
                            })}`}
                            className={`px-3 py-1 rounded ${
                                pageNum === currentPage
                                    ? "bg-yo-orange text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {pageNum}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}