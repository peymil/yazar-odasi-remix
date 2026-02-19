import { prisma } from '~/.server/prisma';
import { useLoaderData, useNavigate } from 'react-router';
import { Route } from './+types/route';
import { ArrowLeftIcon, DocumentIcon, CheckIcon } from '~/components/icons';
import { DownloadIcon, ChevronsUpDown } from 'lucide-react';

export async function loader({ params }: Route.LoaderArgs) {
  const work = await prisma.user_profile_work.findUniqueOrThrow({
    where: {
      id: Number(params.workId),
    },
    include: {
      user_profile_work_characters: true,
      work_projecttag: { include: { project_tag: true } },
      work_projectgenre: { include: { project_genre: true } },
    },
  });

  const tags = work.work_projecttag.map((item) => item.project_tag!.tag_name);
  const genres = work.work_projectgenre.map(
    (item) => item.project_genre!.genre_name,
  );

  return {
    work: {
      ...work,
      tags,
      genres,
    },
  };
}

export default function WorkDetailPage() {
  const { work } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col gap-[60px] px-10 py-5">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-4 text-[#231f20] hover:text-[#F36D31] transition-colors max-w-7xl mx-auto w-full"
      >
        <ArrowLeftIcon className="w-7 h-7" />
        <span className="font-['IBM_Plex_Sans',sans-serif] text-xl">
          işler&apos;e dön
        </span>
      </button>

      {/* Main Content */}
      <div className="flex gap-[50px] max-w-7xl mx-auto w-full">
        {/* Left Side - Image */}
        <div className="flex-shrink-0">
          {work.image ? (
            <img
              src={work.image}
              alt={work.plot_title}
              className="w-[562px] h-[470px] object-cover"
            />
          ) : (
            <div className="bg-[#6B4E9F] w-[562px] h-[470px]" />
          )}
        </div>

        {/* Right Side - Details */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Title and Favorite Icon */}
          <div className="flex items-start justify-between">
            <h1 className="font-['Balkist',sans-serif] font-extrabold text-xs text-[#231f20]">
              {work.plot_title}
            </h1>
            <button className="text-[#231f20] hover:text-[#F36D31]">
              <svg className="w-7 h-7" viewBox="0 0 28 28" fill="currentColor">
                <path d="M14 23.5L12.55 22.2C7.4 17.56 4 14.53 4 10.75C4 7.72 6.42 5.5 9.5 5.5C11.24 5.5 12.91 6.31 14 7.56C15.09 6.31 16.76 5.5 18.5 5.5C21.58 5.5 24 7.72 24 10.75C24 14.53 20.6 17.56 15.45 22.2L14 23.5Z" />
              </svg>
            </button>
          </div>

          {/* Type */}
          <div className="text-[#231f20] text-xl font-['Inter',sans-serif]">
            {work.type}
          </div>

          {/* Hook */}
          <div className="flex flex-col gap-3">
            <h2 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
              Hook
            </h2>
            <p className="font-['Inter',sans-serif] text-xl text-[#231f20] leading-normal">
              {work.hook}
            </p>
          </div>

          <div className="h-[1px] bg-[#231f20]" />

          {/* Logline */}
          <div className="flex flex-col gap-3">
            <h2 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
              Logline
            </h2>
            <p className="font-['Inter',sans-serif] text-xl text-[#231f20] leading-normal whitespace-pre-line">
              {work.logline}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <button className="bg-[#F36D31] text-white px-8 py-2.5 flex items-center gap-3 hover:bg-[#E05520] transition-colors">
              <DownloadIcon className="w-4 h-5 text-white" />
              <span className="font-['Playfair_Display',sans-serif] font-semibold text-xs">
                tam metin
              </span>
            </button>
            <button className="bg-[#6B4E9F] text-white px-8 py-2.5 flex items-center gap-3 hover:bg-[#5A3E8F] transition-colors">
              <DownloadIcon className="w-4 h-5 text-white" />
              <span className="font-['Playfair_Display',sans-serif] font-semibold text-xs">
                tasdik
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tags and Genres */}
      <div className="flex gap-[200px] max-w-7xl mx-auto w-full">
        {/* Tags */}
        <div className="flex gap-8">
          <h3 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
            Etiketler
          </h3>
          <div className="h-8 w-[1px] bg-[#231f20]" />
          <div className="flex flex-wrap gap-4">
            {work.tags.map((tag, index) => (
              <span
                key={index}
                className="font-['Inter',sans-serif] text-xl text-[#231f20]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div className="flex gap-8">
          <h3 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
            Tür
          </h3>
          <div className="h-8 w-[1px] bg-[#231f20]" />
          <div className="flex flex-wrap gap-4">
            {work.genres.map((genre, index) => (
              <span
                key={index}
                className="font-['Inter',sans-serif] text-xl text-[#231f20]"
              >
                {genre}
              </span>
            ))}
            <ListChevronsUpDown />
          </div>
        </div>
      </div>

      {/* Bottom Grid - 4 Cards */}
      <div className="grid grid-cols-2 gap-x-14 gap-y-10 max-w-7xl mx-auto w-full">
        {/* Kısa Özet Card */}
        <div className="border-2 border-[#bcbec0] p-10 flex flex-col gap-4">
          <h3 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
            Kısa Özet
          </h3>
          <p className="font-['Inter',sans-serif] text-xl text-[#231f20] leading-normal whitespace-pre-line">
            {work.synopsis}
          </p>
          <ListChevronsUpDown />
        </div>

        {/* Yazar Odası'nın Yorumu Card */}
        <div className="border-2 border-[#bcbec0] p-10 flex flex-col gap-4">
          <h3 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
            Yazar Odası&apos;nın Yorumu
          </h3>
          <p className="font-['Inter',sans-serif] text-xl text-[#231f20] leading-normal">
            Bu proje hakkında henüz bir değerlendirme yapılmamıştır.
          </p>
          <ListChevronsUpDown />
        </div>

        {/* Karakterler Card */}
        <div className="border-2 border-[#bcbec0] p-10 flex flex-col gap-4">
          <h3 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
            Karakterler
          </h3>
          <div className="flex flex-col gap-2">
            {work.user_profile_work_characters.map((character) => (
              <p
                key={character.id}
                className="font-['Inter',sans-serif] text-xl text-[#231f20] leading-normal"
              >
                {character.name} ({character.description})
              </p>
            ))}
          </div>
          <ListChevronsUpDown />
        </div>

        {/* Benzer İşler Card */}
        <div className="border-2 border-[#bcbec0] p-10 flex flex-col gap-4 relative">
          <h3 className="font-['Inter',sans-serif] font-bold text-xl text-[#231f20]">
            Benzer İşler
          </h3>
          <div className="flex gap-4">
            {work.similar_works && (
              <p className="font-['Inter',sans-serif] text-xl text-[#231f20]">
                {work.similar_works}
              </p>
            )}
          </div>
          <ListChevronsUpDown />
        </div>
      </div>
    </div>
  );
}
