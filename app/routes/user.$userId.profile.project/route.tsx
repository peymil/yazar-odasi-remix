import { ActionFunctionArgs, redirect } from 'react-router';
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
  Select
} from '~/components/ui/select';
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
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
        user_id: currentUser.user.id
      }
    });
    const project = await prisma.user_profile_project.findFirstOrThrow({
      where: {
        id: Number(profile.id)
      }
    });
    await prisma.user_profile_project.update({
      where: {
        id: project.id
      },
      data: {
        ...payload
      }
    });
  } else if (method === 'POST') {
    const { user_profile_project_characters, genres, tags, ...payload } =
      profileProjectCreateSchema.parse(body);

    const profile = await prisma.user_profile.findFirstOrThrow({
      where: {
        user_id: currentUser.user.id
      }
    });

    const project = await prisma.user_profile_project.create({
      data: {
        ...payload,
        profile_id: profile.id,
        user_profile_project_characters: {
          createMany: { data: user_profile_project_characters }
        }
      }
    });

    await prisma.project_projectgenre.createMany({
      data: genres.map((genre_id) => ({
        project_id: project.id,
        project_genre_id: Number(genre_id)
      }))
    });

    await prisma.project_projecttag.createMany({
      data: tags.map((tag_id) => ({
        project_id: project.id,
        project_tag_id: Number(tag_id)
      }))
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
    genres
  };
}

export default function Layout() {
  const data = useLoaderData<typeof loader>();
  const [characters, setCharacters] = React.useState<Array<{ id: number }>>([{ id: Date.now() }]);
  const [selectedTags, setSelectedTags] = useState<(string | number)[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<(string | number)[]>([]);

  return (
    <div className={'container'}>
      <form className={''} method={'POST'}>
        <div className={'flex flex-1 flex-col mr-10'}>
          <Label>Proje Adı</Label>
          <Input
            name={'plot_title'}
            className={'mb-5'}
            type="text"
            placeholder={'Proje Adı'}
            required
          />
          <Label>Proje Synopsis</Label>
          <Textarea
            name={'synopsis'}
            className={'mb-5'}
            placeholder={'Proje Synopsis'}
            required
          />
          <Label>Proje Logline</Label>
          <Input
            name={'logline'}
            className={'mb-5'}
            type="text"
            placeholder={'Proje Logline'}
            required
          />
          <Label>Proje Biçimi</Label>
          <Select name={'type'} required>
            <SelectTrigger className={'mb-5'}>
              <SelectValue placeholder="Proje Biçimi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'film'}>Kitap</SelectItem>
              <SelectItem value={'tv'}>Film</SelectItem>
              <SelectItem value={'book'}>Dizi</SelectItem>
              <SelectItem value={'play'}>Tiyatro</SelectItem>
              <SelectItem value={'game'}>Oyun</SelectItem>
            </SelectContent>
          </Select>
          <Label>Proje Etiketleri</Label>
          <MultiSelect
            name="tags"
            className="mb-5"
            required
            options={
              data?.tags?.map((tag) => ({
                value: tag.id,
                label: tag.tag_name
              })) || []
            }
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="Etiket seçiniz..."
          />
          <Label>Proje Türleri</Label>
          <MultiSelect
            name="genres"
            className="mb-5"
            required
            options={
              data?.genres?.map((genre) => ({
                value: genre.id,
                label: genre.genre_name
              })) || []
            }
            value={selectedGenres}
            onChange={setSelectedGenres}
            placeholder="Tür seçiniz..."
          />
          <Label>Hook</Label>
          <Textarea
            name={'hook'}
            className={'mb-5'}
            placeholder={'Hook'}
            required
          />
          <Label>Benzer İşler</Label>
          <Input
            name={'similar_works'}
            className={'mb-5'}
            type="text"
            placeholder={'Benzer İşler'}
            required
          />
          <Input
            name={'setting'}
            className={'mb-5'}
            type="text"
            placeholder={'Zaman/Mekan'}
            required
          />
        </div>
        <div className={'flex-1'}>
          <div className="flex items-center mb-5">
            <Label>Karakterler</Label>
            {characters.length === 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6"
                onClick={() => {
                  setCharacters([{ id: Date.now() }]);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          {characters.map((char, i) => (
            <div
              key={char.id}
              className="relative mb-8 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">
                  Karakter #{i + 1}
                </Label>
                {i > 0 && (<Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setCharacters(characters.filter((c) => c.id !== char.id));
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>)}

              </div>
              <Input
                name={`user_profile_project_characters[${i}][name]`}
                className="mb-3"
                type="text"
                placeholder="Karakter Adı"
                required
              />
              <Textarea
                name={`user_profile_project_characters[${i}][description]`}
                className="mb-3"
                placeholder="Karakter Açıklaması"
                required
              />
            </div>
          ))}
          {characters.length > 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 w-full mb-4"
              onClick={() => {
                setCharacters([...characters, { id: Date.now() }]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Karakter Ekle
            </Button>
          )}
        </div>
        <Button className={'mr-auto'} type={'submit'}>
          Onayla
        </Button>
      </form>
    </div>
  );
}
