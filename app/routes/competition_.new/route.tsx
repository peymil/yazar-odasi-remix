import React, { useCallback, useRef, useState } from 'react';
import { Form, redirect, useActionData } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { validateSessionToken } from '~/.server/auth';
import { prisma } from '~/.server/prisma';
import { authTokenCookie } from '~/.server/cookies';
import { Route } from './+types/route';

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);
  const session = await validateSessionToken(sessionToken);

  if (!session.user || session.user.company_user.length === 0) {
    return redirect('/');
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const avatar = formData.get('avatar') as string;

  if (!title || !description || !startDate || !endDate) {
    return { error: 'Tüm alanlar zorunludur' };
  }

  const company = session.user.company_user[0].company;

  const { id } = await prisma.competition.create({
    data: {
      title,
      description,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      avatar: avatar || null,
      company_id: company.id,
    },
  });

  return redirect(`/competition/${id}`);
}

export default function NewCompetitionRoute() {
  const actionData = useActionData<typeof action>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const formData = new FormData();
    formData.append('filename', file.name);
    formData.append('contentType', file.type);
    formData.append('folder', 'competition-images');

    const response = await fetch('/api/presigned-url', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { presignedUrl } = await response.json();

    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    const publicUrl = presignedUrl.split('?')[0];
    const publicFileUrl = 'https://cdn.yazarodasi.com/competition-images/' + publicUrl.split('/').pop();

    const hiddenInput = formRef.current?.querySelector('[name="avatar"]') as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = publicFileUrl;
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Yarışma Oluştur
      </h1>

      <Form ref={formRef} method="post" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="aspect-[4/5] overflow-hidden rounded-lg border border-yo-orange bg-white flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Yarışma görsel önizlemesi" className="h-full w-full object-cover" />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-yo-orange hover:bg-yo-orange/90"
            >
              Görsel Yükle
            </Button>
            <Input type="hidden" name="avatar" defaultValue="" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                name="title"
                placeholder="Yarışma başlığını girin"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Yarışma açıklamasını girin"
                className="w-full min-h-[140px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input id="endDate" name="endDate" type="date" className="w-full" />
              </div>
            </div>

            {actionData?.error && (
              <p className="text-red-500 text-sm">{actionData.error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-yo-orange hover:bg-yo-orange/90"
            >
              Yarışma Oluştur
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
