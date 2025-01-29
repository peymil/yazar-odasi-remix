import {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {Label} from "~/components/ui/label";
import {Button} from "~/components/ui/button";
import {Textarea} from "~/components/ui/textarea";
import {prisma} from "~/.server/prisma";
import {Form, useLoaderData} from "@remix-run/react";
import {Input} from "~/components/ui/input";
import invariant from "tiny-invariant";
import {getSessionFromRequest} from "~/.server/auth";

export async function loader({params, request}: LoaderFunctionArgs) {
    invariant(params.userId, "userId is required");
    const currentUser = await getSessionFromRequest(request);
    
    const profile = await prisma.user_profile.findFirstOrThrow({
        where: {
            user_id: Number(params.userId),
        },
    });

    return {
        profile,
        isUsersProfile: currentUser?.user?.id === Number(params.userId)
    };
}

export async function action({request, params}: ActionFunctionArgs) {
    invariant(params.userId, "userId is required");
    const formData = await request.formData();

    const profile = await prisma.user_profile.findFirstOrThrow({
        where: {
            user_id: Number(params.userId),
        },
    });

    await prisma.user_profile.update({
        where: {
            id: profile.id
        },
        data: {
            about: formData.get('about') as string,
            image: formData.get('profileImage') as string || undefined,
            background_image: formData.get('backgroundImage') as string || undefined,
        }
    });

    return null;
}

export default function Layout() {
    const {profile} = useLoaderData<typeof loader>();

    return (
        <div className={'container p-5'}>
            <div className={'flex'}>
                <Form className={'flex flex-1 flex-col gap-4'} method="post" encType="multipart/form-data">
                    <div>
                        <Label>Profil Fotoğrafı</Label>
                        <Input 
                            type="file" 
                            name="profileImage" 
                            accept="image/*"
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label>Arkaplan Fotoğrafı</Label>
                        <Input 
                            type="file" 
                            name="backgroundImage" 
                            accept="image/*"
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label>Hakkında</Label>
                        <Textarea 
                            name="about" 
                            defaultValue={profile.about || ''} 
                            className="mt-2" 
                            placeholder="Kendinizden bahsedin"
                        />
                    </div>

                    <Button type="submit">Kaydet</Button>
                </Form>
                <div className={'flex-1'}/>
            </div>
        </div>
    );
}
