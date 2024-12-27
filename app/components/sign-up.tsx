import {Form} from "@remix-run/react";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {cn} from "~/utils";

export function SignUp({action, className}: { action?: string, className?: string }) {
    return (
        <Form method="post" action={action} className={cn(className, 'flex flex-col gap-2')}>
            <Input type="email" name="email" placeholder={'Email'}/>
            <Input type="text" name="name" placeholder={'Full Name'}/>
            <Input type="password" name="password" placeholder={'Password'}/>
            <Button type="submit">Sign Up</Button>
        </Form>
    );
}
