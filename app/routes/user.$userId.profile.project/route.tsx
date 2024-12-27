import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {profileProjectUpdateSchema} from "~/.server/schemas/profile-project-update.schema";
import {prisma} from "~/.server/prisma";
import {profileProjectCreateSchema} from "~/.server/schemas/profile-project-create.schema";
import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";
import {Label} from "~/components/ui/label";
import {useLoaderData} from "@remix-run/react";
import qs from 'qs'
import {Textarea} from "~/components/ui/textarea";
import {SelectContent, SelectItem, SelectTrigger, SelectValue, Select} from "~/components/ui/select";
import React from "react";
import {getSessionFromRequest} from "~/.server/auth";

export async function action({request}: ActionFunctionArgs) {
    const formQueryString = await request.text();
    const method = request.method;
    const body = qs.parse(formQueryString);
    console.log('body', JSON.stringify(body, null, 2));
    const currentUser = await getSessionFromRequest(request);
    if (method === "PATCH") {
        const {user_profile_project_characters, ...payload} =
            profileProjectUpdateSchema.parse(body);
        const profile = await prisma.user_profile.findFirstOrThrow({
            where: {
                user_id: Number(currentUser.id),
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
    } else if (method === "POST") {
        const {user_profile_project_characters, genres, tags, ...payload} =
            profileProjectCreateSchema.parse(body);

        const profile = await prisma.user_profile.findFirstOrThrow({
            where: {
                user_id: currentUser?.user?.id
            },
        });

        const project = await prisma.user_profile_project.create({
            data: {
                ...payload,
                profile_id: profile.id,
                user_profile_project_characters: {
                    createMany: {data: user_profile_project_characters},
                },
            },
        });

        await prisma.project_projectgenre.createMany({
            data:
                genres.map((genre_id) => ({
                    project_id: project.id,
                    project_genre_id: Number(genre_id),
                }))
        })

        await prisma.project_projecttag.createMany({
            data:
                tags.map((tag_id) => ({
                    project_id: project.id,
                    project_tag_id: Number(tag_id),
                }))
        })

        return redirect(`..`);
    } else {
        throw new Error("Method not allowed");
    }
    redirect("..");
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
    const [characterCount, setCharacterCount] = React.useState(1);
    return (
        <div className={'container'}>
            <form className={''} method={'POST'}>
                <div className={'flex flex-row flex-1'}>
                    <div className={'flex flex-1 flex-col mr-10'}>
                        <Label>Proje Adı</Label>
                        <Input name={'plot_title'} className={'mb-5'} type="text" placeholder={'Proje Adı'}
                               required/>
                        <Label>Proje Synopsis</Label>
                        <Textarea name={'synopsis'} className={'mb-5'} placeholder={'Proje Synopsis'} required/>
                        <Label>Proje Logline</Label>
                        <Input name={'logline'} className={'mb-5'} type="text" placeholder={'Proje Logline'}
                               required/>
                        <Label>Proje Biçimi</Label>
                        <Select
                            name={'type'} required>
                            <SelectTrigger className={'mb-5'}>
                                <SelectValue placeholder="Proje Biçimi"/>
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
                        <select multiple name={'tags[]'} className={'mb-5'} required>
                            {data?.tags?.map((tag) => <option key={tag.id} value={tag.id}>{tag.tag_name}</option>)}
                        </select>
                        <Label>Proje Türleri</Label>
                        <select multiple name={'genres[]'} className={'mb-5'} required>
                            {data?.genres?.map((genre) => <option key={genre.id}
                                                                  value={genre.id}>{genre.genre_name}</option>)}
                        </select>
                        <Label>Hook</Label>
                        <Textarea name={'hook'} className={'mb-5'} placeholder={'Hook'} required/>
                        <Label>Benzer İşler</Label>
                        <Input name={'similar_works'} className={'mb-5'} type="text" placeholder={'Benzer İşler'}
                               required/>
                        <Input name={'setting'} className={'mb-5'} type="text" placeholder={'Zaman/Mekan'}
                               required/>
                    </div>
                    <div className={'flex-1'}>
                        <Label>Karakterler</Label>
                        {
                            Array.from({length: characterCount}).map((_, i) => (
                                <>
                                    <Label>Karakter {i + 1}</Label>
                                    <Input name={`user_profile_project_characters[${i}][name]`} className={'mb-5'}
                                           type="text"
                                           placeholder={'Karakter Adı'} required/>
                                    <Textarea name={`user_profile_project_characters[${i}][description]`}
                                              className={'mb-5'}
                                              placeholder={'Karakter Açıklaması'} required/>
                                </>
                            ))
                        }
                        <Button type={'button'} onClick={() => setCharacterCount(characterCount + 1)}>Add
                            Character</Button>
                    </div>
                </div>
                <Button className={'mr-auto'} type={'submit'}>Onayla</Button>
            </form>
        </div>
    );
}
