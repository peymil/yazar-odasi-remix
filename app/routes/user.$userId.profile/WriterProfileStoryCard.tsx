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
  className?: string;
  id: number;
};

export const WriterProfileStoryCard: React.FC<WriterProfileStoryCardProps> = ({
  plot_title,
  synopsis,
  type,
  className,
}) => {
  return (
    <div className={cn('border-2 border-[#231f20] flex flex-col', className)}>
      {/* Orange thumbnail placeholder */}
      <div className="bg-[#F36D31] h-48 flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-3 text-[#231f20]">
        <p className="text-xl">{type || 'Senarist'}</p>
        <p className="text-xl font-bold">
          {plot_title}
        </p>
        <p className="text-xl line-clamp-4">
          {synopsis}
        </p>
      </div>

      {/* View button */}
      <button className="bg-[#F36D31] text-white text-[10px] font-primary font-semibold py-3 hover:bg-[#E05520] transition-colors">
        incele
      </button>
    </div>
  );
};
