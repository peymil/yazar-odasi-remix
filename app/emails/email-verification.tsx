import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface EmailVerificationProps {
  verificationUrl: string;
}

export const EmailVerification = ({
  verificationUrl,
}: EmailVerificationProps) => (
  <Html>
    <Head />
    <Preview>E-posta adresinizi doğrulayın</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>E-posta adresinizi doğrulayın</Heading>
        <Text style={text}>
          Yazar Odasına kaydolduğunuz için teşekkürler! Kayıt işleminizi tamamlamak için lütfen e-posta adresinizi doğrulayın.
        </Text>
        <Link
          href={verificationUrl}
          target="_blank"
          style={{
            ...link,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          E-posta adresinizi doğrulamak için buraya tıklayın
        </Link>
        <Text
          style={{
            ...text,
            color: '#ababab',
            marginTop: '14px',
            marginBottom: '16px',
          }}
        >
          Eğer bir hesap oluşturmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.
        </Text>
      </Container>
    </Body>
  </Html>
);

EmailVerification.PreviewProps = {
  verificationUrl: 'https://example.com/verify-email?token=123',
} as EmailVerificationProps;

export default EmailVerification;

const main = {
  backgroundColor: '#ffffff',
};

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const link = {
  color: '#2754C5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
};