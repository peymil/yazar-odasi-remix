import { prisma } from '~/.server/prisma';
import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { authSignUpSchema } from '~/.server/schemas/auth-sign-up-password.schema';
import { hashPassword } from '~/.server/auth';
import { SignUp } from '~/components/sign-up';
import { sendEmail } from '~/.server/email';
import { EmailVerification } from '~/emails/email-verification';

export async function action({ request }: ActionFunctionArgs) {
  const body = Object.fromEntries(await request.formData());
  const { name, password, email } = authSignUpSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'Email already exists' };
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

export default function Layout() {
  return (
    <div className={'container mx-auto flex items-center justify-center gap-4'}>
      <SignUp />
    </div>
  );
}
