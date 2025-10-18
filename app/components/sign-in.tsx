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
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg">
      <Form
        method={'POST'}
        action={action}
        className={cn(className, 'space-y-4')}
      >
        {actionData?.error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {actionData.error}
          </div>
        )}
        {displayMessage && (
          <div className={`p-3 border rounded ${success || message ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
            {displayMessage}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full focus:ring-2 focus:ring-yo-orange"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-yo-orange hover:bg-yo-orange/90 focus:ring-2 focus:ring-yo-orange text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Sign In
        </Button>

        <div className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/sign-up"
            className="font-medium text-yo-orange hover:text-yo-orange/90"
          >
            Sign up
          </Link>
        </div>
      </Form>
    </div>
  );
}
