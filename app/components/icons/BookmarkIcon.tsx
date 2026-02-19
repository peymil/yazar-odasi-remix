export function BookmarkIcon({
  className = '',
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 22 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 1H21V26L11 20L1 26V1Z"
        fill={filled ? '#FF6D2B' : 'none'}
        stroke={filled ? '#FF6D2B' : '#231f20'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
