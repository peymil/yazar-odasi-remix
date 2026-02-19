import React from 'react';
import { cn } from '~/utils';

export type WriterProfileStoryCardProps = {
  tags: string[];
  genres: string[];
  hook: string;
  logline: string;
  plot_title: string;
  profile_id: number | null;
  similar_works: string;
  synopsis: string;
  type: string;
  image?: string | null;
  className?: string;
  id: number;
};

export const WriterProfileStoryCard: React.FC<WriterProfileStoryCardProps> = ({
  plot_title,
  synopsis,
  type,
  genres,
  image,
  className,
}) => {
  const genreText = genres && genres.length > 0 ? genres[0] : 'Roman';
  
  return (
    <div 
      className={cn(
        'border-2 border-[#bcbec0] p-5 grid grid-cols-[auto_1fr] gap-5 w-full h-full',
        className
      )}
    >
      {/* Left side - Image and button */}
      <div className="flex flex-col items-stretch shrink-0">
        {/* Image or purple placeholder */}
        {image ? (
          <img 
            src={image} 
            alt={plot_title}
            className="w-[227px] h-[368px] object-cover mb-2"
          />
        ) : (
          <div className="bg-[#6B4E9F] w-[227px] h-[368px] mb-2" />
        )}
        
        {/* View button */}
        <button className="bg-[#F36D31] text-white text-[10px] font-semibold py-3 hover:bg-[#E05520] transition-colors">
          incele
        </button>
      </div>

      {/* Right side - Content */}
      <div className="flex flex-col gap-5 text-[#231f20] text-lg min-w-0">
        <p className="break-words">{type || 'Yazar'}</p>
        <p className="break-words font-bold">{plot_title}</p>
        <p className="break-words">{genreText}</p>
        <p className="line-clamp-4 overflow-hidden break-words">
          {synopsis}
        </p>
      </div>
    </div>
  );
};
