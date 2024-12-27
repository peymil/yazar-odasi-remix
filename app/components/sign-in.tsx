import {Form} from "@remix-run/react";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";

export function SignIn({action}: { action?: string }) {
    return (
        <Form method={"POST"} action={action}>
                <Input type="email" name="email" placeholder={'Email'}/>
                <Input type="password" name="password" placeholder={'Password'}/>
            <Button type="submit">Sign In</Button>
        </Form>
    );
}

