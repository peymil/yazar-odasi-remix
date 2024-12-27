import {LoaderFunctionArgs} from "@remix-run/node";
import {prisma} from "~/.server/prisma";
import {Link, Outlet, useLoaderData, useLocation} from "@remix-run/react";

export async function loader({params}: LoaderFunctionArgs) {
    const project = await prisma.user_profile_project.findUniqueOrThrow({
        where: {
            id: Number(params.projectId),
        },
        include: {
            user_profile_project_characters: true,
            project_projecttag: {include: {project_tag: true}},
            project_projectgenre: {include: {project_genre: true}},
        },
    });

    const {user} = await prisma.user_profile.findFirstOrThrow({
        where: {
            id: project.profile_id!,
        },
        select: {
            user: true,
        },
    });

    return {
        project,
        user,
    };
}

export default function Layout() {
    const {project} = useLoaderData<typeof loader>();
    const location = useLocation()
    const locationArray = location.pathname.split('/')
    const currentPath = locationArray[locationArray.length - 1]
    return (
        <div className={'container mx-auto'}>
            <h1 className={'text-3xl'}>{project.plot_title}</h1>
            <h1 className={'inline mr-10'}>{project.type}</h1>
            <div className={'inline'}>
                <div className={'inline-flex gap-1'}>
                    {project.project_projectgenre.map(({project_genre}) => (
                        <span className={'bg-yo-orange rounded-[3px]'} key={project_genre.id}>
                        <span className={'m-1'}>{project_genre.genre_name}</span>
                    </span>
                    ))}
                </div>
            </div>
            <div className={'flex gap-5 text-lg my-5'}>
                <Link className={currentPath === 'about' ? 'opacity-50' : ''} to={'./about'}>Hakkında</Link>
                <Link className={currentPath === 'evaluations' ? 'opacity-50' : ''} to={'./evaluations'}>Değerlendirmeler</Link>
                <Link className={currentPath === 'metrics' ? 'opacity-50' : ''} to={'./metrics'}>Veriler</Link>
            </div>
            <Outlet/>
        </div>
    );
}
