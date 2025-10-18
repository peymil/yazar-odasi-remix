import { prisma } from '~/.server/prisma';

import { redirect } from 'react-router';
import { authSignInSchema } from '~/.server/schemas/auth-sign-in.schema';
import {
  createSession,
  generateSessionToken,
  verifyPassowrd,
} from '~/.server/auth';
import { authTokenCookie } from '~/.server/cookies';
import { SignIn } from '~/components/sign-in';
import { Route } from './+types/route';
import { sendEmail } from '~/.server/email';
import { EmailVerification } from '~/emails/email-verification';
import crypto from 'crypto';

export async function action({ request }: Route.ActionArgs) {
  const body = Object.fromEntries(await request.formData());
  const payload = authSignInSchema.parse(body);
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });
  if (!user) {
    return { error: 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.' };
  }
  if (!(await verifyPassowrd(payload.password, user.password))) {
    return { error: 'Şifre yanlış.' };
  }
  if (!user.emailVerified) {
    // Send verification email if not verified
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.email_verification.deleteMany({
      where: { userId: user.id },
    });

    await prisma.email_verification.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    const verificationUrl = `${request.headers.get('origin')}/auth/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      react: EmailVerification({ verificationUrl }),
    });

    return { error: 'Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın. Doğrulama e-postası gönderildi.' };
  }
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  return redirect('/', {
    headers: {
      'Set-Cookie': await authTokenCookie.serialize(sessionToken, {
        expires: session.expiresAt,
      }),
    },
  });
}

export default function Layout() {
  return (
    <div className={'container mx-auto flex items-center justify-center'}>
      <SignIn />
    </div>
  );
}
