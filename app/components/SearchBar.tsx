import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { cn } from "~/utils";
import { useEffect, useState } from "react";
import { useSubmit, useSearchParams } from "@remix-run/react";

export function SearchBar({ className }: { className?: string }) {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const submit = useSubmit();

    useEffect(() => {
        if (searchTerm.length >= 2) {
            const timeoutId = setTimeout(() => {
                submit({ q: searchTerm }, { method: "get" });
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchTerm, submit]);

    return (
        <Form method="get" className={cn("w-full max-w-2xl mx-auto", className)}>
            <div className="relative">
                <Input
                    type="search"
                    name="q"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-yo-orange"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>
        </Form>
    );
}