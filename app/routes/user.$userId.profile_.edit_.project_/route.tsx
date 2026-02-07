import { ActionFunctionArgs, redirect, Link } from 'react-router';
import { profileProjectUpdateSchema } from '~/.server/schemas/profile-project-update.schema';
import { prisma } from '~/.server/prisma';
import { profileProjectCreateSchema } from '~/.server/schemas/profile-project-create.schema';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useLoaderData } from 'react-router';
import qs from 'qs';
import { Textarea } from '~/components/ui/textarea';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
} from '~/components/ui/select';
import React, { useState } from 'react';
import { Plus, Minus, X, ChevronDown } from 'lucide-react';
import { getSessionFromRequest } from '~/.server/auth';
import { MultiSelect } from '~/components/ui/multi-select';
import { Route } from './+types/route';

export async function action({ request }: Route.ActionArgs) {
  const formQueryString = await request.text();
  const method = request.method;
  const body = qs.parse(formQueryString);
  const currentUser = await getSessionFromRequest(request);
  if (!currentUser?.user) {
    throw new Error('Unauthorized');
  }
  if (method === 'PATCH') {
    const { user_profile_project_characters, ...payload } =
      profileProjectUpdateSchema.parse(body);
    const profile = await prisma.user_profile.findFirstOrThrow({
      where: {
        user_id: currentUser.user.id,
      },
    });
    const project = await prisma.user_profile_project.findFirstOrThrow({
      where: {
        id: Number(profile.id),
      },
    });
    await prisma.user_profile_project.update({
      where: {
        id: project.id,
      },
      data: {
        ...payload,
      },
    });
  } else if (method === 'POST') {
    const { user_profile_project_characters, genres, tags, ...payload } =
      profileProjectCreateSchema.parse(body);

    const profile = await prisma.user_profile.findFirstOrThrow({
      where: {
        user_id: currentUser.user.id,
      },
    });

    const project = await prisma.user_profile_project.create({
      data: {
        ...payload,
        profile_id: profile.id,
        user_profile_project_characters: {
          createMany: { data: user_profile_project_characters },
        },
      },
    });

    await prisma.project_projectgenre.createMany({
      data: genres.map((genre_id) => ({
        project_id: project.id,
        project_genre_id: Number(genre_id),
      })),
    });

    await prisma.project_projecttag.createMany({
      data: tags.map((tag_id) => ({
        project_id: project.id,
        project_tag_id: Number(tag_id),
      })),
    });

    return redirect(`..`);
  } else {
    throw new Error('Method not allowed');
  }
  redirect('..');
}

export async function loader() {
  const tags = await prisma.project_tag.findMany();
  const genres = await prisma.project_genre.findMany();
  return {
    tags,
    genres,
  };
}

export default function Layout() {
  const data = useLoaderData<typeof loader>();
  const [characters, setCharacters] = React.useState<Array<{ id: number }>>([
    { id: Date.now() },
  ]);
  const [selectedTags, setSelectedTags] = useState<(string | number)[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<(string | number)[]>([]);

  return (
    <div className="min-h-screen bg-white px-10 py-5">
      {/* Back Link */}
      <Link
        to=".."
        relative="path"
        className="flex items-center gap-3 text-[#231f20] text-xl hover:text-[#F36D31] transition-colors w-fit mb-8"
      >
        <svg width="32" height="29" viewBox="0 0 32 29" fill="none">
          <path
            d="M14.5 1C14.5 1 1 7.5 1 14.5C1 21.5 14.5 28 14.5 28"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M3 14.5H31" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="font-ibm-plex-sans">Profile Dön</span>
      </Link>

      <form method="POST" className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 gap-10">
          {/* Left Column */}
          <div>
            {/* Photo Placeholder */}
            <div className="w-full h-[470px] bg-gray-200 mb-12"></div>

            {/* Synopsis Section */}
            <div className="mb-12">
              <h3 className="font-inter text-xl text-[#231f20] mb-3">Kısa Özet</h3>
              <Textarea
                name="synopsis"
                className="border border-[#231f20] rounded p-4 h-40 font-inter text-[15px] text-[#231f20]"
                placeholder="Kısa özet yazınız..."
                required
              />
            </div>

            {/* Similar Works Section */}
            <div className="mb-12">
              <h3 className="font-inter text-xl text-[#231f20] mb-3">Benzer İşler</h3>
              <Input
                name="similar_works"
                className="border border-[#231f20] rounded px-4 py-2 font-ibm-plex-sans text-[15px]"
                placeholder="Benzer işleri yazınız..."
              />
            </div>

            {/* Document Upload Buttons */}
            <div className="flex gap-7 mb-12">
              <Button
                type="button"
                className="bg-[#F36D31] hover:bg-[#E05520] text-white font-playfair-display font-semibold text-xs rounded px-6 py-2"
              >
                leopoldun_sabunu.pdf
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border border-[#F36D31] text-[#F36D31] hover:bg-[#F36D31] hover:text-white font-playfair-display font-semibold text-xs rounded px-6 py-2"
              >
                linki güncelle
              </Button>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              className="bg-[#5848BC] hover:bg-[#4839A3] text-white font-playfair-display font-semibold text-xs rounded px-12 py-2 flex items-center gap-2"
            >
              <svg width="23" height="21" viewBox="0 0 23 21" fill="none">
                <path
                  d="M1 11L7.5 19L22 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              kaydet
            </Button>
          </div>

          {/* Right Column - Form Fields */}
          <div>
            {/* İş Adı */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">İş Adı</Label>
              <Input
                name="plot_title"
                className="border border-[#231f20] rounded px-4 py-2 font-ibm-plex-sans text-[15px]"
                type="text"
                placeholder="İş adını giriniz"
                required
              />
            </div>

            {/* İş Tipi */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">İş Tipi</Label>
              <div className="relative">
                <Select name="type" required>
                  <SelectTrigger className="border border-[#231f20] rounded px-4 py-2 font-ibm-plex-sans text-[15px]">
                    <SelectValue placeholder="İş tipini seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roman">roman</SelectItem>
                    <SelectItem value="öykü">öykü</SelectItem>
                    <SelectItem value="şiir">şiir</SelectItem>
                    <SelectItem value="tiyatro">tiyatro</SelectItem>
                    <SelectItem value="senaryo">senaryo</SelectItem>
                  </SelectContent>
                </Select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#231f20] pointer-events-none" />
              </div>
            </div>

            {/* Hook */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Hook</Label>
              <Input
                name="hook"
                className="border border-[#231f20] rounded px-4 py-2 font-inter text-[15px] text-[#231f20]"
                type="text"
                placeholder="Hook giriniz"
                required
              />
            </div>

            {/* Logline */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Logline</Label>
              <Textarea
                name="logline"
                className="border border-[#231f20] rounded px-4 py-2 font-inter text-[15px] text-[#231f20] min-h-[64px]"
                placeholder="Logline giriniz"
                required
              />
            </div>

            {/* Tür (Genres) */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Tür</Label>
              <MultiSelect
                name="genres"
                required
                options={
                  data?.genres?.map((genre) => ({
                    value: genre.id,
                    label: genre.genre_name,
                  })) || []
                }
                value={selectedGenres}
                onChange={setSelectedGenres}
                placeholder="Tür seçiniz..."
              />
            </div>

            {/* Etiketler (Tags) */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Etiketler</Label>
              <MultiSelect
                name="tags"
                required
                options={
                  data?.tags?.map((tag) => ({
                    value: tag.id,
                    label: tag.tag_name,
                  })) || []
                }
                value={selectedTags}
                onChange={setSelectedTags}
                placeholder="Etiket seçiniz..."
              />
            </div>

            {/* Karakter #1 */}
            {characters.map((char, i) => (
              <div key={char.id} className="mb-8">
                <Label className="font-inter text-[21.4px] text-[#231f20] mb-2 block">
                  Karakter #{i + 1}
                </Label>
                <Textarea
                  name={`user_profile_project_characters[${i}][description]`}
                  className="border border-[#231f20] rounded px-4 py-2 font-inter text-[15px] text-[#231f20] min-h-[81px]"
                  placeholder="Karakter açıklaması giriniz"
                  required
                />
                <input
                  type="hidden"
                  name={`user_profile_project_characters[${i}][name]`}
                  value={`Karakter ${i + 1}`}
                />
                {i > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-[#F36D31] hover:text-[#E05520]"
                    onClick={() => {
                      setCharacters(characters.filter((c) => c.id !== char.id));
                    }}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Karakteri Sil
                  </Button>
                )}
              </div>
            ))}

            {/* Add Character Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-8 border border-[#231f20] text-[#231f20] hover:bg-gray-50"
              onClick={() => {
                setCharacters([...characters, { id: Date.now() }]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Karakter Ekle
            </Button>

            {/* Setting (Hidden) */}
            <Input
              type="hidden"
              name="setting"
              defaultValue="İstanbul, 90'lar"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
