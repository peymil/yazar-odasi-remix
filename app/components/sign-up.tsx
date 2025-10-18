import { Form, Link, useActionData } from 'react-router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils';

export function SignUp({
  action,
  className,
}: {
  action?: string;
  className?: string;
}) {
  const actionData = useActionData<{ error?: string }>();
  return (
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg">
      <Form
        onError={() => {
          
        }}
        method="post"
        action={action}
        className={cn(className, 'space-y-4')}
      >
        {actionData?.error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {actionData.error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-posta
            </label>
            <Input
              type="email"
              name="email"
              placeholder="E-posta adresinizi girin"
              className="w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tam Ad
            </label>
            <Input
              type="text"
              name="name"
              placeholder="Tam adınızı girin"
              className="w-full focus:ring-2 focus:ring-yo-orange"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Şifre
            </label>
            <Input
              type="password"
              name="password"
              placeholder="Şifrenizi girin"
              className="w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-yo-orange hover:bg-yo-orange/90 focus:ring-2 focus:ring-yo-orange text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Üye Ol
        </Button>

        <div className="text-center text-sm text-gray-600 mt-4">
          Zaten hesabınız var mı?{' '}
          <Link
            to="/auth/sign-in"
            className="font-medium text-yo-orange hover:text-yo-orange/90"
          >
            Giriş yap
          </Link>
        </div>
      </Form>
    </div>
  );
}
