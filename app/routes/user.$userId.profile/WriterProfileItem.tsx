import React from 'react';
import dayjs from 'dayjs';

export type WriterProfilePortfolioItemProps = {
  id: number;
  title: string;
  company_name: string;
  description: string;
  end_date: Date | null;
  location: string;
  start_date: Date;
};

export const WriterProfileItem: React.FC<WriterProfilePortfolioItemProps> = ({
  location,
  company_name,
  description,
  end_date,
  start_date,
  title,
}) => {
  return (
    <div>
      <p className={'font-bold'}>{title}</p>
      <p>
        <span className={'text-orange-400'}>{company_name}</span>, {location} -
        ({dayjs(start_date).format('DD/MM/YYYY')} -{' '}
        {end_date ? dayjs(end_date).format('DD/MM/YYYY') : 'present'})
      </p>
      <p>{description}</p>
    </div>
  );
};
