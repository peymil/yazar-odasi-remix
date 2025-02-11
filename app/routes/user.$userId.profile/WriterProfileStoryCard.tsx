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
  className,
}) => {
  return (
    <div className={cn(className, 'border border-yo-orange rounded')}>
      <div className={'h-1/2 relative'}>
        <img
          src={''}
          alt={'Story Thumbnail'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className={' text-xs  p-2'}>
        <h1
          className={
            'font-extrabold mb-1 underline-offset-4 underline overflow-ellipsis'
          }
        >
          {plot_title}
        </h1>
        <p className={'overflow-ellipsis line-clamp-6'}>{synopsis}</p>
      </div>
    </div>
  );
};
