import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  headers: {
    "X-PM-Message-Stream": process.env.NODE_ENV === 'production' ? 'outbound' : 'dev',
  },
  tls: {
    ciphers:'SSLv3'
}
});

interface SendEmailOptions {
  to: string;
  subject: string;
  react: JSX.Element;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const html = await render(react);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}