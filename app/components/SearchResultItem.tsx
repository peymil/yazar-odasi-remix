'use client';

import { useMemo } from 'react';

interface SearchResultItemProps {
  item: any;
  type: 'users' | 'projects' | 'works' | 'competitions';
  onClick: (href: string) => void;
}

export function SearchResultItem({ item, type, onClick }: SearchResultItemProps) {
  const handleClick = () => {
    let href = '';

    switch (type) {
      case 'users':
        href = `/user/${item.user_id}/profile`;
        break;
      case 'projects':
        href = `/user/${item.user_id}/profile/project/${item.id}/about`;
        break;
      case 'works':
        href = `/user/${item.user_id}/profile/work/${item.id}/about`;
        break;
      case 'competitions':
        href = `/competition/${item.id}`;
        break;
    }

    onClick(href);
  };

  const genres = useMemo(() => {
    if (!item.genres || !Array.isArray(item.genres)) return [];
    return item.genres
      .filter((g: any) => g && g.genre_name)
      .slice(0, 2)
      .map((g: any) => g.genre_name);
  }, [item.genres]);

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-transparent hover:border-yo-orange"
    >
      {type === 'users' && (
        <div className="flex items-center gap-3">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
            {item.current_title && (
              <p className="text-sm text-gray-600 truncate">{item.current_title}</p>
            )}
          </div>
        </div>
      )}

      {(type === 'projects' || type === 'works') && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{item.plot_title}</h3>
          <div className="flex items-center gap-2">
            {genres.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="inline-block text-xs bg-yo-orange text-white px-2 py-1 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
          {item.synopsis && (
            <p className="text-sm text-gray-600 line-clamp-1">{item.synopsis}</p>
          )}
        </div>
      )}

      {type === 'competitions' && (
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
          <div className="flex items-center gap-2">
            {item.company_name && (
              <span className="text-sm text-gray-600">{item.company_name}</span>
            )}
            {item.delivery_count !== undefined && (
              <span className="text-sm text-gray-500">
                • {item.delivery_count} doğru
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
          )}
        </div>
      )}
    </button>
  );
}
