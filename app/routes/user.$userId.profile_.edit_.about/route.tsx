import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { prisma } from '~/.server/prisma';
import { Form, redirect, useLoaderData, useNavigate } from 'react-router';
import { Input } from '~/components/ui/input';
import invariant from 'tiny-invariant';
import { getSessionFromRequest } from '~/.server/auth';
import { Route } from './+types/route';
import { useRef, useState, useEffect } from 'react';
import Modal from 'react-modal';

export async function loader({ params, request }: Route.ActionArgs) {
  invariant(params.userId, 'userId is required');
  const currentUser = await getSessionFromRequest(request);

  const profile = await prisma.user_profile.findFirstOrThrow({
    where: {
      user_id: Number(params.userId),
    },
  });

  return {
    profile,
    isUsersProfile: currentUser?.user?.id === Number(params.userId),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.userId, 'userId is required');
  const formData = await request.formData();

  const profile = await prisma.user_profile.findFirstOrThrow({
    where: {
      user_id: Number(params.userId),
    },
  });

  console.log('profile', formData.get('profileImageUrl'));

  await prisma.user_profile.update({
    where: {
      id: profile.id,
    },
    data: {
      about: formData.get('about') as string,
      image: formData.get('profileImageUrl') as string,
      background_image: formData.get('backgroundImageUrl') as string,
    },
  });

  

  return redirect("..")
}

export default function Layout() {
  const { profile } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(profile.image || null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(profile.background_image || null);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (profilePreview && !profilePreview.startsWith('http')) {
        URL.revokeObjectURL(profilePreview);
      }
      if (backgroundPreview && !backgroundPreview.startsWith('http')) {
        URL.revokeObjectURL(backgroundPreview);
      }
    };
  }, [profilePreview, backgroundPreview]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, urlFieldName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create temporary preview URL
    const previewUrl = URL.createObjectURL(file);
    if (urlFieldName === 'profileImageUrl') {
      setProfilePreview(previewUrl);
    } else {
      setBackgroundPreview(previewUrl);
    }

    const formData = new FormData();
    formData.append('filename', file.name);
    formData.append('contentType', file.type);
    formData.append('folder', 'profile-pictures');

    const response = await fetch('/api/presigned-url', {
      method: 'POST',
      body: formData,
    });

    const { presignedUrl } = await response.json();
    
    // Upload to S3
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // Get the public URL
    const publicUrl = presignedUrl.split('?')[0]

    const publicFileUrl = "https://cdn.yazarodasi.com/profile-pictures/" + publicUrl.split('/').pop();

    
    // Set the URL in a hidden input
    const hiddenInput = formRef.current?.querySelector(`[name="${urlFieldName}"]`) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = publicFileUrl;
    }
  };

  return (
    <Modal
      className="absolute bg-white p-6 shadow-2xl w-full h-full md:w-2/3 md:h-5/6 overflow-y-auto overscroll-none"
      htmlOpenClassName="overflow-hidden"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      isOpen={true}
      onRequestClose={() => navigate('..')}
      shouldCloseOnOverlayClick={true}
    >
      <div className={'container p-5'}>
          <Form
            ref={formRef}
            className={'flex flex-1 flex-col gap-4'}
            method="post"
          >
          <div>
            <Label>Profil Fotoğrafı</Label>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                onChange={(e) => handleFileChange(e, 'profileImageUrl')}
                accept="image/*"
              />
              {profilePreview && (
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input type="hidden" name="profileImageUrl" />
            </div>
          </div>

          <div>
            <Label>Arkaplan Fotoğrafı</Label>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                onChange={(e) => handleFileChange(e, 'backgroundImageUrl')}
                accept="image/*"
              />
              {backgroundPreview && (
                <div className="w-full h-32 rounded overflow-hidden">
                  <img
                    src={backgroundPreview}
                    alt="Background Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input type="hidden" name="backgroundImageUrl" />
            </div>
          </div>

          <div>
            <Label>Hakkında</Label>
            <Textarea
              name="about"
              defaultValue={profile.about || ''}
              className="mt-2"
              placeholder="Kendinizden bahsedin"
            />
          </div>

          <div className='absolute bottom-0 right-0 m-4'>
            <Button
              className={'sticky float-right top-auto'}
              type={'submit'}
            >
              Onayla
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
