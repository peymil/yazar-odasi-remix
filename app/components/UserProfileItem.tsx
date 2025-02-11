import { Link } from 'react-router';

type UserProfileItemProps = {
  id: number;
  userId: number;
  currentTitle?: string | null;
  about?: string | null;
  name: string;
  user: {
    email: string;
    image?: string | null;
  };
};

export function UserProfileItem({
  id,
  userId,
  currentTitle,
  about,
  user,
  name,
}: UserProfileItemProps) {
  return (
    <Link
      to={`/user/${userId}/profile`}
      className="block p-4 hover:bg-gray-50 transition-colors duration-200 border-b last:border-b-0"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg">{name}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          {currentTitle && (
            <p className="text-sm text-gray-500 truncate">{currentTitle}</p>
          )}
          {about && (
            <p className="text-sm text-gray-500 truncate mt-1">{about}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
