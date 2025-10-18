import { ActionFunctionArgs, data, redirect } from 'react-router';
import { Form, useActionData, useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { prisma } from '~/.server/prisma';
import { getSessionFromRequest } from '~/.server/auth';
import { Route } from './+types/route';

export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const session = await getSessionFromRequest(request);

  if (!session?.user) {
    return data({ error: 'Yetkisiz' }, { status: 401 });
  }

  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const website = formData.get('website') as string;

  try {
    const company = await prisma.company.create({
      data: {
        email,
        name,
        company_profile: {
          create: {
            name,
            description,
            website,
          },
        },
      },
    });

    // Create company_user relationship separately
    await prisma.company_user.create({
      data: {
        user_id: session.user.id,
        company_id: company.id,
      },
    });

    return redirect(`/company/${company.id}`);
  } catch (error) {
    return data({ error: 'Şirket oluşturulamadı' }, { status: 500 });
  }
}

export default function CompanyCreate() {
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-2xl mt-10">
      <h1 className="text-3xl font-bold mb-8">Şirket Oluştur</h1>
      <Form method="post" className="space-y-6">
        <div>
          <Label htmlFor="email">Şirket E-postası</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="name">Şirket Adı</Label>
          <Input id="name" name="name" type="text" required className="mt-1" />
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <Input
            id="description"
            name="description"
            type="text"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="website">Web Sitesi</Label>
          <Input
            id="website"
            name="website"
            type="url"
            required
            className="mt-1"
          />
        </div>

        {actionData?.error && (
          <p className="text-red-500">{actionData.error}</p>
        )}

        <div className="flex gap-4">
          <Button type="submit" className="bg-yo-orange">
            Şirket Oluştur
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            İptal
          </Button>
        </div>
      </Form>
    </div>
  );
}
