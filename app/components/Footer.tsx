import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="relative w-full mx-auto">
      
      {/* Footer links */}
      <nav className="flex items-center justify-center gap-[165px] text-[#231f20] text-[20px] border-t-2 border-[#EE5622] pt-2">
        <Link to="/about" className="hover:text-[#EE5622] transition-colors">
          Hakkımızda
        </Link>
        <Link to="/subscription" className="hover:text-[#EE5622] transition-colors">
          Abonelik Seçenekleri
        </Link>
        <Link to="/terms" className="hover:text-[#EE5622] transition-colors">
          Kullanım Koşulları
        </Link>
        <Link to="/contact" className="hover:text-[#EE5622] transition-colors">
          İletişim
        </Link>
      </nav>
    </footer>
  );
}
