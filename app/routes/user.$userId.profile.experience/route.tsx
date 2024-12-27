import {ActionFunctionArgs} from "@remix-run/node";
import {Label} from "~/components/ui/label";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {Textarea} from "~/components/ui/textarea";
import {profileExperienceCreateSchema} from "~/.server/schemas/profile-experience-create.schema";
import {prisma} from "~/.server/prisma";

export async function action({request}: ActionFunctionArgs) {
    const body = Object.fromEntries(await request.formData());
    console.log('annen', body)
    const experience = await profileExperienceCreateSchema.parse(body);

    prisma.user_profile_experience.create({
        data: experience
    });
}

export default function Layout() {
    return (
        <div className={'container'}>
            <div className={'flex'}>
                <form className={'flex flex-1 flex-col justify-center '} method={'POST'}>
                    <Label>Konum</Label>
                    <Input name={'setting'} className={'mb-5'} type="text" placeholder={'Location'} required/>
                    <Label>Açıklama</Label>
                    <Textarea name={'description'} className={'mb-5'} placeholder={'Açıklama'} required/>
                    <Label>Başlık</Label>
                    <Input name={'title'} className={'mb-5'} type="text" placeholder={'Başlık'} required/>
                    <Label>Şirket Adı</Label>
                    <Input name={'company_name'} className={'mb-5'} type="text" placeholder={'Şirket Adı'}
                           required/>
                    <Label>Başlangıç Tarihi</Label>
                    <Input name={'start_date'} className={'mb-5'} type="date" placeholder={'Başlangıç Tarihi'}
                           required/>
                    <Label>Bitiş Tarihi</Label>
                    <Input name={'end_date'} className={'mb-5'} type="date" placeholder={'Bitiş Tarihi'} required/>
                    <Button type={'submit'}>Onayla</Button>
                </form>
                <div className={'flex-1'}/>
            </div>
        </div>
    );
}
