import { useNavigate, useLoaderData, Link } from 'react-router';
import { Route } from './+types/route';
import invariant from 'tiny-invariant';
import { prisma } from '~/.server/prisma';
import { getProject } from '../user.$userId.profile/service.server';
import { getSessionFromRequest } from '~/.server/auth';

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

  return (
    <div className="bg-white min-h-screen flex flex-col gap-7 px-10 py-8">
      {/* Back to Profile Link */}
      <Link 
        to=".."
        relative="path"
        className="flex items-center gap-3 text-[#231f20] text-xl hover:text-[#F36D31] transition-colors w-fit"
      >
        <svg width="32" height="29" viewBox="0 0 32 29" fill="none">
          <path
            d="M14.5 1C14.5 1 1 7.5 1 14.5C1 21.5 14.5 28 14.5 28"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M3 14.5H31" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="font-primary">Profile dön</span>
      </Link>
      
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row items-start gap-8 w-full max-w-6xl mx-auto p-32">
        {/* Profile Photo */}
        <div className="w-full md:w-1/2 flex-shrink-0 relative">
          <img
            src={
              profile.image ||
              'https://cdn.yazarodasi.com/profile-photo-placeholder.webp'
            }
            alt={profile.name || 'Profile'}
            className="w-full h-auto object-cover"
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
          <div className="relative pt-10">
            <button
              onClick={() => navigate('./about')}
              className="absolute top-10 right-0 text-gray-400 hover:text-[#F36D31] transition-colors"
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

      {/* Works and Projects Section - Side by Side */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Works List */}
        <div className="flex flex-col gap-4 border-2 border-[#231f20] p-6">
          {experiences.map((experience) => (
            <EditableItem
              key={experience.id}
              title={experience.title}
              type={experience.company_name}
              onEdit={() => navigate(`./work/${experience.id}/edit`)}
            />
          ))}
          {experiences.length === 0 && (
            <p className="text-center text-gray-400 py-12">
              Henüz iş eklenmedi.
            </p>
          )}
          <button 
            onClick={() => navigate('./work')}
            className="w-full bg-[#F36D31] text-white text-[10px] font-['Playfair_Display',sans-serif] font-semibold py-3 hover:bg-[#E05520] transition-colors mt-4"
          >
            yeni iş ekle
          </button>
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-4 border-2 border-[#231f20] p-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`./project/${project.id}/edit`}
              className="block"
            >
              <EditableItem
                title={project.plot_title}
                type={project.type}
                onEdit={() => {}}
              />
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-center text-gray-400 py-12">
              Henüz proje eklenmedi.
            </p>
          )}
          <Link
            to="./project"
            className="block w-full bg-[#F36D31] text-white text-center text-[10px] font-['Playfair_Display',sans-serif] font-semibold py-3 hover:bg-[#E05520] transition-colors mt-4"
          >
            yeni proje ekle
          </Link>
        </div>
      </div>
    </div>
  );
}
