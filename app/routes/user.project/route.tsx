import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/.server/prisma";
import { Link, useLoaderData } from "@remix-run/react";
import { SearchBar } from "~/components/SearchBar";

type ProjectGenre = {
    id: number;
    name: string;
}

type ProjectTag = {
    id: number;
    name: string;
}

type Project = {
    id: number;
    plot_title: string;
    user_id: number;
    genres: ProjectGenre[];
    tags: ProjectTag[];
}

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("q");

    if (!searchQuery || searchQuery.length < 2) {
        return {
            projects: [] as Project[],
        };
    }

    // Using raw query to search only plot_title
    const projects = await prisma.$queryRaw<Project[]>`
        SELECT 
            p.*,
            up.user_id,
            array_agg(DISTINCT jsonb_build_object(
                'id', pg.id,
                'name', pg.name
            )) as genres,
            array_agg(DISTINCT jsonb_build_object(
                'id', pt.id,
                'name', pt.name
            )) as tags
        FROM user_profile_project p
        JOIN user_profile up ON p.profile_id = up.id
        LEFT JOIN project_projectgenre ppg ON p.id = ppg.project_id
        LEFT JOIN project_genre pg ON ppg.genre_id = pg.id
        LEFT JOIN project_projecttag ppt ON p.id = ppt.project_id
        LEFT JOIN project_tag pt ON ppt.tag_id = pt.id
        WHERE p.plot_title ILIKE ${`%${searchQuery}%`}
        GROUP BY p.id, up.user_id
        ORDER BY p.plot_title
        LIMIT 10
    `;

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
                {projects.map((project: Project) => (
                    <Link
                        key={project.id}
                        to={`/user/${project.user_id}/profile/project/${project.id}/about`}
                        className="block"
                    >
                        <div className="p-4 border rounded-lg hover:border-yo-orange transition-colors duration-200">
                            <h2 className="text-xl font-bold mb-2">{project.plot_title}</h2>
                            <div className="flex flex-wrap gap-2">
                                {project.genres
                                    .filter((genre: ProjectGenre) => genre.name)
                                    .map((genre: ProjectGenre) => (
                                        <span
                                            key={genre.id}
                                            className="px-2 py-1 bg-gray-100 text-sm rounded"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                {project.tags
                                    .filter((tag: ProjectTag) => tag.name)
                                    .map((tag: ProjectTag) => (
                                        <span
                                            key={tag.id}
                                            className="px-2 py-1 bg-yo-orange/10 text-sm rounded"
                                        >
                                            {tag.name}
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