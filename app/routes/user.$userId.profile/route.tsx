import { LoaderFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant';
import { prisma } from '~/.server/prisma';
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useOutlet,
  useSearchParams,
} from 'react-router';
import Modal from 'react-modal';
import { WriterProfileItem } from '~/routes/user.$userId.profile/WriterProfileItem';
import { WriterProfileStoryCard } from '~/routes/user.$userId.profile/WriterProfileStoryCard';
import { Button } from '~/components/ui/button';
import { getProject } from './service.server';
import { getSessionFromRequest } from '~/.server/auth';
import { PostFeed } from '~/components/PostFeed';
import { Route } from './+types/route';
import { EditIcon } from '~/components/icons';
export async function loader({ params, request }: Route.ActionArgs) {
  invariant(params.userId, 'userId is required');
  const { userId } = params;
  const currentUser = await getSessionFromRequest(request);
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: Number(userId),
    },
  });
  const profile = await prisma.user_profile.findFirstOrThrow({
    where: {
      user_id: Number(userId),
    },
  });

  const projects = await getProject(profile.id);

  const works = await prisma.user_profile_work
    .findMany({
      where: {
        profile_id: profile.id,
      },
      include: {
        work_projectgenre: {
          include: {
            project_genre: true,
          },
        },
        work_projecttag: { include: { project_tag: true } },
      },
    })
    .then((works) => {
      return works.map(
        ({ work_projectgenre, work_projecttag, ...work }) => {
          return {
            ...work,
            genres: work_projectgenre.map(
              (genre) => genre.project_genre!.genre_name
            ),
            tags: work_projecttag.map((tag) => tag.project_tag!.tag_name),
          };
        }
      );
    });

  const posts = await prisma.post.findMany({
    where: { user_id: Number(userId) },
    orderBy: { created_at: 'desc' },
    include: {
      user: {
        include: {
          user_profile: true,
        },
      },
      company: true,
    },
  });

  const likedPosts = currentUser?.user
    ? await prisma.post_like.findMany({
        where: { user_id: currentUser.user.id },
        select: { post_id: true },
      })
    : [];

  const isUsersProfile = currentUser?.user?.id === user.id;

  return {
    user,
    profile,
    projects,
    works,
    isUsersProfile,
    posts,
    likedPostIds: likedPosts.map((like) => like.post_id),
  };
}

export default function Layout() {
  const {
    user,
    profile,
    projects,
    works,
    isUsersProfile,
    posts,
    likedPostIds,
  } = useLoaderData<typeof loader>();
  const inOutlet = !!useOutlet();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'projeler';

  return (
    <div className="bg-white min-h-screen flex flex-col gap-7 px-10 pt-10 w-full">
      {/* Profile Section */}
      <div className="flex flex-col gap-8 w-full max-w-6xl items-center mx-auto">
        {/* Profile Photo */}
          <img
            src={
              profile.image ||
              'https://cdn.yazarodasi.com/profile-photo-placeholder.webp'
            }
            alt={profile.name || 'Profile'}
            className="w-64 h-64 object-cover"
          />

        {/* Profile Info */}
        <div className=" flex flex-col gap-4 items-center">
          <div className="flex items-start justify-between">
            <h1 className="text-6xl font-primary font-extrabold text-[#231f20]">
              {profile.name}
            </h1>
            {isUsersProfile && (
              <button
                onClick={() => navigate('./edit')}
                className="text-[#231f20] hover:text-[#F36D31] transition-colors"
                aria-label="Düzenle"
              >
                <EditIcon className="w-7 h-7" />
              </button>
            )}
          </div>
          <div className="text-[#231f20] text-xl leading-normal pl-20 pr-20 ">
            {profile.about?.split('\n').map((line, i) => (
              <p key={i} className="mb-6">
                {line}
              </p>
            )) || (
              <p className="text-gray-400">Henüz hakkında bilgisi eklenmedi.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2.5 w-full max-w-6xl mx-auto">
        <button
          onClick={() => setSearchParams({ tab: 'işler' }, { preventScrollReset: true })}
          className={`px-12 py-2.5 rounded font-primary font-semibold text-[15px] transition-colors ${
            activeTab === 'işler'
              ? 'bg-[#F36D31] text-white'
              : 'bg-white text-[#231f20] border-2 border-[#231f20]'
          }`}
        >
          işler
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'projeler' }, { preventScrollReset: true })}
          className={`px-12 py-2.5 rounded font-primary font-semibold text-[15px] transition-colors ${
            activeTab === 'projeler'
              ? 'bg-[#F36D31] text-white'
              : 'bg-white text-[#231f20] border-2 border-[#231f20]'
          }`}
        >
          projeler
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-6xl mx-auto">
        {activeTab === 'projeler' ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <Link to={`/user/${user.id}/profile/project/${project.id}`} key={index}>
                  <WriterProfileStoryCard {...project} />
                </Link>
              ))}
            </div>
            {projects.length === 0 && (
              <p className="text-center text-gray-400 py-12">
                Henüz proje eklenmedi.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {works.map((work, index) => (
                <Link to={`/user/${user.id}/profile/work/${work.id}`} key={index}>
                  <WriterProfileStoryCard {...work} />
                </Link>
              ))}
            </div>
            {works.length === 0 && (
              <p className="text-center text-gray-400 py-12">
                Henüz iş eklenmedi.
              </p>
            )}
          </div>
        )}
      </div>

      <Modal
        className={
          'absolute bg-white p-6 shadow-2xl w-full h-full md:w-2/3 md:h-5/6 overflow-y-auto overscroll-none '
        }
        htmlOpenClassName={'overflow-hidden'}
        overlayClassName={
          'fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center'
        }
        isOpen={inOutlet}
        onRequestClose={() => navigate('./')}
        shouldCloseOnOverlayClick={true}
      >
        <Outlet />
      </Modal>
    </div>
  );
}
