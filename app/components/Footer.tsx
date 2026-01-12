import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="relative h-[55.06px] w-full max-w-[1202.63px] mx-auto">
      {/* Background line decoration */}
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 1203 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="0"
            x2="1203"
            y2="0"
            stroke="#EE5622"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Footer links */}
      <nav className="absolute left-[9.18%] right-[10.25%] top-1/2 -translate-y-1/2 flex items-center gap-[165px] text-[#231f20] text-[20px] font-['Degular',sans-serif]">
        <Link to="/about" className="hover:text-[#EE5622] transition-colors">
          hakkımızda
        </Link>
        <Link to="/subscription" className="hover:text-[#EE5622] transition-colors">
          abonelik seçenekleri
        </Link>
        <Link to="/terms" className="hover:text-[#EE5622] transition-colors">
          kullanım koşulları
        </Link>
        <Link to="/contact" className="hover:text-[#EE5622] transition-colors">
          iletişim
        </Link>
      </nav>
    </footer>
  );
}
