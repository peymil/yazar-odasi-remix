import {ActionFunctionArgs} from "@remix-run/node";
import {Label} from "~/components/ui/label";
import {Button} from "~/components/ui/button";
import {Textarea} from "~/components/ui/textarea";
import {prisma} from "~/.server/prisma";

export async function action({request}: ActionFunctionArgs) {
    const body = Object.fromEntries(await request.formData());

    await prisma.user_profile.update({
        where: {
            id: 1
        },
        data: {
            about: body.about as string
        }
    })
}

export default function Layout() {
    return (
        <div className={'container'}>
            <div className={'flex'}>
                <form className={'flex flex-1 flex-col justify-center align-middle '} method={"POST"}>
                    <Label>Hakkında</Label>
                    <Textarea name={'about'} className={'mb-5'} placeholder={'Location'} required/>
                    <Button type={'submit'}>Onayla</Button>
                </form>
                <div className={'flex-1'}/>
            </div>
        </div>
    );
}
