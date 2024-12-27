import type {MetaFunction} from "@remix-run/node";
import {SignUp} from "~/components/sign-up";
import {useOptionalUser} from "~/lib/authUtils";

export const meta: MetaFunction = () => {
    return [
        {title: "New Remix App"},
        {name: "description", content: "Welcome to Remix!"},
    ];
};

export default function Index() {
    const isAuthanticated = useOptionalUser();
    return (isAuthanticated  ? <div>Authenticated</div> :(
        <div className={"container mx-auto flex items-center justify-center h-[calc(100vh-144px)]"}>
            <div className={'flex-1 flex flex-col justify-center items-center'}>
                <img src={'https://cdn.yazarodasi.com/startup-hero.png'} alt={'Illustration of three writers smiling'}/>
                <h1 className={'text-5xl'}>{"Yazar Odası'na Katıl"}</h1>
                <p className={'text-center'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mattis mauris a magna venenatis
                    semper. Suspendisse placerat porta orci, a vehicula sem suscipit feugiat.</p>
            </div>
            <div className={'flex-1 p-56'}>
                <SignUp action={'/auth/sign-up'} />
            </div>
        </div>
    ) );
}
