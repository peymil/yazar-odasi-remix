import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/.server/prisma";
import { Link, useLoaderData } from "@remix-run/react";
import { SearchBar } from "~/components/SearchBar";
import { projectSearch } from "@prisma/client/sql";
import { project_genre, project_tag } from "@prisma/client";


export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("q");

    if (!searchQuery || searchQuery.length < 2) {
        return {
            projects: [] as projectSearch.Result[],
        };
    }

    // Using raw query to search only plot_title
    const projects = await prisma.$queryRawTyped(projectSearch(searchQuery,50,0));
    return {
        projects,
    };
}

export default function ProjectSearch() {
    const { projects } = useLoaderData<typeof loader>();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Project Search</h1>
            <SearchBar className="mb-8" placeholder="Search projects by title..." />
            <div className="space-y-4">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        to={`/user/${project.user_id}/profile/project/${project.id}/about`}
                        className="block"
                    >
                        <div className="p-4 border rounded-lg hover:border-yo-orange transition-colors duration-200">
                            <h2 className="text-xl font-bold mb-2">{project.plot_title}</h2>
                            <div className="flex flex-wrap gap-2">
                                {(project.genres as project_genre[])
                                    .filter((genre) => genre.genre_name)
                                    .map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="px-2 py-1 bg-gray-100 text-sm rounded"
                                        >
                                            {genre.genre_name}
                                        </span>
                                    ))}
                                {(project.tags as project_tag[])
                                    .filter((tag) => tag.tag_name)
                                    .map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-2 py-1 bg-yo-orange/10 text-sm rounded"
                                        >
                                            {tag.tag_name}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </Link>
                ))}
                {projects.length === 0 && (
                    <p className="text-center text-gray-500">
                        No projects found. Try a different search term.
                    </p>
                )}
            </div>
        </div>
    );
}