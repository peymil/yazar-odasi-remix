import { useSearchParams } from "@remix-run/react";

interface PaginationProps {
    hasMore: boolean;
    take: number;
    limit: number;
    className?: string;
}

export function Pagination({ hasMore, take, limit, className = "" }: PaginationProps) {
    const [searchParams] = useSearchParams();

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="flex items-center gap-4">
                {take > 0 && (
                    <a
                        href={`?${new URLSearchParams({
                            ...Object.fromEntries(searchParams.entries()),
                            take: Math.max(0, take - limit).toString(),
                        })}`}
                        className="px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-100"
                    >
                        Previous
                    </a>
                )}
                {hasMore && (
                    <a
                        href={`?${new URLSearchParams({
                            ...Object.fromEntries(searchParams.entries()),
                            take: (take + limit).toString(),
                        })}`}
                        className="px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-100"
                    >
                        Next
                    </a>
                )}
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span>Items per page:</span>
                {[10, 25, 50, 100].map((limitSize) => (
                    <a
                        key={limitSize}
                        href={`?${new URLSearchParams({
                            ...Object.fromEntries(searchParams.entries()),
                            limit: limitSize.toString(),
                            take: "0",
                        })}`}
                        className={`px-2 py-1 rounded ${
                            limitSize === limit
                                ? "bg-yo-orange text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        {limitSize}
                    </a>
                ))}
            </div>
        </div>
    );
}
