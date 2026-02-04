import { Form, Link, useActionData, useSearchParams } from 'react-router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils';

export function SignIn({
  action,
  className,
}: {
  action?: string;
  className?: string;
}) {
  const actionData = useActionData<{ error?: string }>();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const success = searchParams.get('success');
  const message = searchParams.get('message');

  const getMessage = () => {
    if (error === 'invalid_verification') {
      return 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.';
    }
    if (success === 'email_verified') {
      return 'E-posta adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.';
    }
    if (message === 'verification_email_sent') {
      return 'Doğrulama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.';
    }
    return null;
  };

  const displayMessage = getMessage();

  return (
    <div className="flex items-center justify-center gap-8 lg:gap-16 px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-16 min-h-[480px]">
      <div className="flex flex-col gap-3 items-center justify-center max-w-xs">
        <h1 className="font-primary font-extrabold text-[22px] text-[#231f20] text-center">
          Yazar Odası'na hoş geldin!
        </h1>
        <p className="font-normal text-[20px] text-[#231f20] text-center">
          Herkes senin hikayeni bekliyor.
        </p>
        
        <Form
          method="POST"
          action={action}
          className={cn(className, 'flex flex-col gap-3 w-full')}
        >
          {actionData?.error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {actionData.error}
            </div>
          )}
          {displayMessage && (
            <div className={`p-3 border rounded text-sm ${success || message ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
              {displayMessage}
            </div>
          )}
          
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
            Giriş Yap
          </Button>

          <div className="text-center text-[10px] text-black">
            Zaten Hesabın var mı?{' '}
            <Link
              to="/auth/sign-up"
              className="text-[#f36d31] hover:underline"
            >
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
