import { Link } from 'react-router';
import { WritersIcon, ProjectsIcon, CallsIcon, SearchIcon, LoginIcon } from './icons';

interface HeaderProps {
  user?: {
    id: string;
    company_user: any[];
  } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-end justify-between px-10 py-2.5 w-full pb-6 border-b-2 border-b-yo-orange">
      {/* Logo */}
      <Link to="/" className="h-[133.893px] w-[142.28px] flex-shrink-0">
        <img
          src="https://cdn.yazarodasi.com/yazar_odasi_logo.svg"
          alt="Yazar Odası Logo"
          className="w-full h-full object-contain"
        />
      </Link>

      {/* Yazarlar */}
      <Link 
        to="/user/profile" 
        className="inline-flex items-center gap-2.5 text-[#231f20] text-[20px]"
      >
        <WritersIcon className="w-[28.6px] h-[28.69px]" />
        <span>yazarlar</span>
      </Link>

      {/* Projeler */}
      <Link 
        to="/user/project" 
        className="inline-flex items-center gap-3 text-[#231f20] text-[20px]"
      >
        <ProjectsIcon className="w-[33.8px] h-[27.13px]" />
        <span>projeler</span>
      </Link>

      {/* Açık Çağrılar */}
      <Link 
        to="/competition" 
        className="inline-flex items-center gap-3 text-[#231f20] text-[20px]"
      >
        <CallsIcon className="w-[27.03px] h-[27.13px]" />
        <span>açık çağrılar</span>
      </Link>

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-transparent border-2 border-[#231f20] rounded-full px-4 py-2 w-[199.43px] h-[37.66px]">
          <SearchIcon className="w-[20.97px] h-[24.18px] text-[#bcbec0]" />
          <input
            type="search"
            placeholder="yazar, proje, açık çağrı"
            className="bg-transparent border-none outline-none text-[#bcbec0] text-[15px] w-full placeholder:text-[#bcbec0]"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-[38.64px] w-px bg-[#231f20]" />

      {/* Giriş Yap / User Menu */}
      {user ? (
        <Link 
          to={`/user/${user.id}/profile`}
          className="inline-flex items-center gap-3 text-[#231f20] text-[20px]"
        >
          <LoginIcon className="w-[28.54px] h-[27.11px]" />
          <span>profil</span>
        </Link>
      ) : (
        <Link 
          to="/auth/sign-in" 
          className="inline-flex items-center gap-3 text-[#231f20] text-[20px]"
        >
          <LoginIcon className="w-[28.54px] h-[27.11px]" />
          <span>giriş yap</span>
        </Link>
      )}
    </header>
  );
}
