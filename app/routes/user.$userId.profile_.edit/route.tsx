import { useNavigate, useLoaderData, Link, Outlet, useOutlet } from 'react-router';
import { Route } from './+types/route';
import invariant from 'tiny-invariant';
import { prisma } from '~/.server/prisma';
import { getProject } from '../user.$userId.profile/service.server';
import { getSessionFromRequest } from '~/.server/auth';
import Modal from 'react-modal';

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.userId, 'userId is required');
  const { userId } = params;
  const currentUser = await getSessionFromRequest(request);
  
  // Only allow users to edit their own profile
  if (currentUser?.user?.id !== Number(userId)) {
    throw new Response('Unauthorized', { status: 401 });
  }

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

  const experiences = await prisma.user_profile_experience.findMany({
    where: {
      profile_id: profile.id,
    },
  });

  return {
    user,
    profile,
    projects,
    experiences,
  };
}

function EditableItem({ 
  title, 
  type, 
  onEdit 
}: { 
  title: string; 
  type: string; 
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200">
      <div className="flex gap-16">
        <p className="text-xl font-['Inter',sans-serif] text-[#231f20]">{title}</p>
        <p className="text-xl font-['Inter',sans-serif] text-[#231f20]">{type}</p>
      </div>
      <button 
        onClick={onEdit}
        className="text-gray-400 hover:text-[#F36D31] transition-colors"
        aria-label="Düzenle"
      >
        <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
          <path
            d="M20.7 6.3L21.7 7.3L8.7 20.3L7 21L7.7 19.3L20.7 6.3ZM23.4 2C23.1 2 22.8 2.1 22.6 2.3L20.1 4.8L23.2 7.9L25.7 5.4C26.1 5 26.1 4.4 25.7 4L24 2.3C23.8 2.1 23.5 2 23.2 2H23.4ZM19.4 5.5L4 20.9V24H7.1L22.5 8.6L19.4 5.5Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}

export default function ProfileEdit() {
  const { profile, projects, experiences } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const inOutlet = !!useOutlet();

  return (
    <div className="bg-white min-h-screen flex flex-col gap-14 px-10 py-8">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row items-start gap-8 w-full max-w-6xl mx-auto">
        {/* Profile Photo */}
        <div className="w-full md:w-1/2 flex-shrink-0 relative">
          <img
            src={
              profile.image ||
              'https://cdn.yazarodasi.com/profile-photo-placeholder.webp'
            }
            alt={profile.name || 'Profile'}
            className="w-full h-auto object-cover border-2 border-[#F36D31]"
          />
          {/* Edit icon on photo */}
          <button
            onClick={() => navigate('./about')}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Fotoğrafı düzenle"
          >
            <svg className="w-6 h-6 text-[#231f20]" viewBox="0 0 28 28" fill="none">
              <path
                d="M20.7 6.3L21.7 7.3L8.7 20.3L7 21L7.7 19.3L20.7 6.3ZM23.4 2C23.1 2 22.8 2.1 22.6 2.3L20.1 4.8L23.2 7.9L25.7 5.4C26.1 5 26.1 4.4 25.7 4L24 2.3C23.8 2.1 23.5 2 23.2 2H23.4ZM19.4 5.5L4 20.9V24H7.1L22.5 8.6L19.4 5.5Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Profile Info */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <h1 className="text-xs font-['Balkist',sans-serif] font-extrabold text-[#231f20]">
              {profile.name}
            </h1>
          </div>
          
          {/* Edit icon for description */}
          <div className="relative">
            <button
              onClick={() => navigate('./about')}
              className="absolute top-0 right-0 text-gray-400 hover:text-[#F36D31] transition-colors"
              aria-label="Açıklamayı düzenle"
            >
              <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none">
                <path
                  d="M20.7 6.3L21.7 7.3L8.7 20.3L7 21L7.7 19.3L20.7 6.3ZM23.4 2C23.1 2 22.8 2.1 22.6 2.3L20.1 4.8L23.2 7.9L25.7 5.4C26.1 5 26.1 4.4 25.7 4L24 2.3C23.8 2.1 23.5 2 23.2 2H23.4ZM19.4 5.5L4 20.9V24H7.1L22.5 8.6L19.4 5.5Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="text-[#231f20] text-xl leading-normal pr-10">
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
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2.5 w-full max-w-6xl mx-auto">
        <button className="px-12 py-2.5 rounded font-primary font-semibold text-[15px] bg-white text-[#231f20] border-2 border-[#231f20]">
          işler
        </button>
        <button className="px-12 py-2.5 rounded font-primary font-semibold text-[15px] bg-white text-[#231f20] border-2 border-[#231f20]">
          projeler
        </button>
      </div>

      {/* Works Section */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Works List */}
        <div className="border-2 border-[#231f20] p-6">
          <div className="flex flex-col gap-4 mb-6">
            {experiences.map((experience) => (
              <EditableItem
                key={experience.id}
                title={experience.title}
                type={experience.company_name}
                onEdit={() => navigate(`./experience`)}
              />
            ))}
          </div>
          <button 
            onClick={() => navigate('./experience')}
            className="w-full bg-[#F36D31] text-white text-[10px] font-['Playfair_Display',sans-serif] font-semibold py-3 hover:bg-[#E05520] transition-colors"
          >
            yeni iş ekle
          </button>
        </div>

        {/* Projects List */}
        <div className="border-2 border-[#231f20] p-6">
          <div className="flex flex-col gap-4 mb-6">
            {projects.map((project) => (
              <EditableItem
                key={project.id}
                title={project.plot_title}
                type={project.type}
                onEdit={() => navigate(`./project/${project.id}/about`)}
              />
            ))}
          </div>
          <button 
            onClick={() => navigate('./project')}
            className="w-full bg-[#F36D31] text-white text-[10px] font-['Playfair_Display',sans-serif] font-semibold py-3 hover:bg-[#E05520] transition-colors"
          >
            yeni proje ekle
          </button>
        </div>
      </div>

      {/* Back to Profile Link */}
      <Link 
        to=".."
        className="flex items-center gap-3 text-[#231f20] text-xl hover:text-[#F36D31] transition-colors w-fit"
      >
        <svg className="w-7 h-7" viewBox="0 0 29 29" fill="none">
          <path
            d="M14.5 0C6.5 0 0 6.5 0 14.5C0 22.5 6.5 29 14.5 29C22.5 29 29 22.5 29 14.5C29 6.5 22.5 0 14.5 0ZM14.5 26.1C8.1 26.1 2.9 20.9 2.9 14.5C2.9 8.1 8.1 2.9 14.5 2.9C20.9 2.9 26.1 8.1 26.1 14.5C26.1 20.9 20.9 26.1 14.5 26.1ZM19.4 13.1H11.9L15.5 9.5L14.5 8.5L9 14L14.5 19.5L15.5 18.5L11.9 14.9H19.4V13.1Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-['IBM_Plex_Sans',sans-serif]">profil'e dön</span>
      </Link>

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
