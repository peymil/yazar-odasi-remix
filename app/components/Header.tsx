import { useState } from 'react';
import { Link, Form, useLocation, useNavigate } from 'react-router';
import { WritersIcon, ProjectsIcon, CallsIcon, SearchIcon, LoginIcon } from './icons';
import { SearchModal } from './SearchModal';
import { company_user, user_profile } from '@prisma/client';

interface HeaderProps {
  user?: {
    id: string;
    company_user: company_user[]
    user_profile: user_profile[]
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isProjectsActive = pathname === '/user/project' || pathname.startsWith('/user/project/');
  const isCallsActive = pathname === '/competition' || pathname.startsWith('/competition/');
  const isWritersActive = pathname.startsWith('/user/') && !isProjectsActive;
  const isProfileActive =
    !!user &&
    (pathname === `/user/${user.id}/profile` || pathname.startsWith(`/user/${user.id}/profile/`));

  return (
    <>
      <header className="flex items-end justify-between px-10 py-2.5 w-full pb-6  border-b-yo-orange">
        {/* Logo */}
        <button 
          onClick={() => navigate('..')}
          className="h-[133.893px] w-[142.28px] flex-shrink-0 cursor-pointer "
        >
          <img
            src="https://cdn.yazarodasi.com/yazar_odasi_logo.svg"
            alt="Yazar Odası Logo"
            className="w-full h-full object-contain"
          />
        </button>

        {/* Yazarlar */}
        <Link 
          to="/user/profile" 
          relative="route"
          className={`inline-flex items-center gap-2.5 text-[20px] hover:text-yo-orange ${isWritersActive ? 'text-yo-orange' : 'text-[#231f20]'}`}
        >
          <WritersIcon className="w-[28.6px] h-[28.69px]" />
          <span>yazarlar</span>
        </Link>

        {/* Projeler */}
        <Link 
          to="/user/project" 
          className={`inline-flex items-center gap-3 text-[20px] hover:text-yo-orange ${isProjectsActive ? 'text-yo-orange' : 'text-[#231f20]'}`}
        >
          <ProjectsIcon className="w-[33.8px] h-[27.13px]" />
          <span>projeler</span>
        </Link>

        {/* Açık Çağrılar */}
        <Link 
          to="/competition" 
          className={`inline-flex items-center gap-3 text-[20px] hover:text-yo-orange ${isCallsActive ? 'text-yo-orange' : 'text-[#231f20]'}`}
        >
          <CallsIcon className="w-[27.03px] h-[27.13px]" />
          <span>açık çağrılar</span>
        </Link>

        {/* Search */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="relative flex items-center gap-3 bg-transparent border-2 border-[#231f20] rounded-full px-4 py-2 w-[199.43px] h-[37.66px] hover:border-yo-orange transition-colors"
        >
          <SearchIcon className="w-[20.97px] h-[24.18px] text-[#bcbec0]" />
          <span className="text-[#bcbec0] text-[15px]">ara...</span>
        </button>

        {/* Divider */}
        <div className="h-[38.64px] w-px bg-[#231f20]" />

        {/* Giriş Yap / User Menu */}
        {user ? (
          <div className="flex items-center gap-4 hover:text-yo-orange">
            <Link 
              to={`/user/${user.id}/profile`}
              className={`inline-flex items-center gap-3 text-[20px] hover:text-yo-orange ${isProfileActive ? 'text-yo-orange' : 'text-[#231f20]'}`}
            >
              <span>{user.user_profile[0]?.name || 'profil'}</span>
            </Link>
            <Form method="post" action="/auth/sign-out" className="inline ">
              <button 
                type="submit"
                className="hover:text-yo-orange inline-flex items-center gap-3 text-[#231f20] text-[20px] transition-colors"
              >
                çıkış yap
              </button>
            </Form>
          </div>
        ) : (
          <Link 
            to="/auth/sign-in" 
            className="hover:text-yo-orange inline-flex items-center gap-3 text-[#231f20] text-[20px]"
          >
            <LoginIcon className="w-[28.54px] h-[27.11px]" />
            <span>giriş yap</span>
          </Link>
        )}
      </header>
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
