import { prisma } from '~/.server/prisma';
import type { ActionFunctionArgs } from 'react-router';
import { redirect, Form, Link, useActionData } from 'react-router';
import { authSignUpSchema } from '~/.server/schemas/auth-sign-up-password.schema';
import { hashPassword } from '~/.server/auth';
import { sendEmail } from '~/.server/email';
import { EmailVerification } from '~/emails/email-verification';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

export async function action({ request }: ActionFunctionArgs) {
  const body = Object.fromEntries(await request.formData());
  const { name, password, email } = authSignUpSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'Bu e-posta adresi zaten kayıtlı.' };
  }

  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
      emailVerified: false,
    },
  });

  await prisma.$transaction([
    prisma.user_profile.create({
      data: {
        user_id: user.id,
        name,
        about: 'About me.',
      },
    }),
    prisma.email_verification.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    }),
  ]);

  const verificationUrl = `${request.headers.get('origin')}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    react: EmailVerification({ verificationUrl }),
  });

  return redirect('/auth/sign-in?message=verification_email_sent');
}

export default function SignUpPage() {
  const actionData = useActionData<{ error?: string }>();
  
  return (
    <div className="flex items-center justify-center gap-8 lg:gap-16 px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-16 min-h-[480px]">
      <div className="flex flex-col gap-3 items-center justify-center max-w-xs">
        <h1 className="font-primary font-extrabold text-[22px] text-[#231f20] text-center">
          Yazar Odası'na hoş geldin!
        </h1>
        <p className="font-normal text-[20px] text-[#231f20] text-center">
          Herkes senin hikayeni bekliyor.
        </p>
        
        <Form method="post" className="flex flex-col gap-3 w-full">
          {actionData?.error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {actionData.error}
            </div>
          )}
          
          <Input
            type="text"
            name="name"
            placeholder="İsim Soyisim"
            className="h-[38px] w-full border border-[#bcbec0] rounded-md px-3 text-[15px] placeholder:text-[#bcbec0]"
          />
          
          <Input
            type="email"
            name="email"
            placeholder="e-mail"
            className="h-[38px] w-full border border-[#bcbec0] rounded-md px-3 text-[15px] placeholder:text-[#bcbec0]"
          />

          <Input
            type="password"
            name="password"
            placeholder="şifre"
            className="h-[38px] w-full border border-[#bcbec0] rounded-md px-3 text-[15px] placeholder:text-[#bcbec0]"
          />

          <Button
            type="submit"
            className="w-full h-[38px] bg-[#f36d31] hover:bg-[#f36d31]/90 text-white font-primary font-semibold text-[12px] rounded-md"
          >
            Üye Ol
          </Button>

          <div className="text-center text-[10px] text-black">
            Zaten Hesabın var mı?{' '}
            <Link to="/auth/sign-in" className="text-[#f36d31] hover:underline">
              Giriş yap?
            </Link>
          </div>
        </Form>
      </div>
      
      <div className="hidden md:block relative h-[370px] w-[322px] flex-shrink-0">
        <img 
          src="/images/auth-illustration.png" 
          alt="Writing illustration" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
