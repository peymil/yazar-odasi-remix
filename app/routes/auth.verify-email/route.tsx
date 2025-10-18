import { prisma } from '~/.server/prisma';
import { ActionFunctionArgs, redirect } from 'react-router';
import { sendEmail } from '~/.server/email';
import { EmailVerification } from '~/emails/email-verification';
import crypto from 'crypto';

export async function loader({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect('/');
  }

  const verification = await prisma.email_verification.findFirst({
    where: {
      token,
      expires: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!verification) {
    return redirect('/auth/sign-in?error=invalid_verification');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    }),
    prisma.email_verification.delete({
      where: { id: verification.id },
    }),
  ]);

  return redirect('/auth/sign-in?success=email_verified');
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();

  if (!email) {
    return { error: 'Email is required' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true }
  });

  if (!user) {
    return { error: 'User not found' };
  }

  if (user.emailVerified) {
    return { error: 'Email already verified' };
  }

  // Delete any existing verification tokens
  await prisma.email_verification.deleteMany({
    where: { userId: user.id },
  });

  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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

  return { success: true };
}