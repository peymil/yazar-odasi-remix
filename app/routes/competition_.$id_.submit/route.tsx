import { redirect } from 'react-router';
import { Form, Link, useActionData, useLoaderData } from 'react-router';
import { Minus, Upload } from 'lucide-react';
import React, { useCallback } from 'react';
import { prisma } from '~/.server/prisma';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { validateSessionToken } from '~/.server/auth';
import { authTokenCookie } from '~/.server/cookies';
import { Route } from './+types/route';


export async function loader({ request, params }: Route.ActionArgs) {
  console.log('competition.id.submit');

  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  const session = await validateSessionToken(sessionToken);
  if (!session.user) {
    return redirect('/auth/sign-in');
  }

  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id!) },
    include: {
      company: {
        include: {
          company_profile: true,
        },
      },
    },
  });

  if (!competition) {
    throw new Response('Not Found', { status: 404 });
  }

  const isCompanyUser = session.user.company_user.some(
    (cu) => cu.company_id === competition.company_id
  );

  if (isCompanyUser) {
    return redirect(`/competitions/${competition.id}`);
  }

  return { competition };
}

export async function action({ request, params }: Route.ActionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  const session = await validateSessionToken(sessionToken);
  if (!session.user) {
    return redirect('/auth/sign-in');
  }

  const formData = await request.formData();
  const docs = formData.getAll('docs[]')
    .filter((doc: FormDataEntryValue) => doc && typeof doc === 'string') as string[];

  if (docs.length === 0) {
    return { error: 'At least one document is required' };
  }

  console.log('docs', docs);

  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(params.id!) },
  });

  if (!competition || new Date(competition.end_date) < new Date()) {
    return redirect(`/competition/${params.id}`);
  }

  await prisma.competition_delivery.create({
    data: {
      competition_id: competition.id,
      user_id: session.user.id,
      docs,
    },
  });

  return redirect(`/competition/${params.id}`);
}

export default function CompetitionSubmitRoute() {
  const { competition } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const companyProfile = competition.company.company_profile[0];
  const [docs, setDocs] = React.useState<Array<{ id: number; name: string; url: string }>>([]);
  const [uploading, setUploading] = React.useState(false);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed.');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return;
      }

      setUploading(true);
      try {
        // Generate UUID and create file path
   
        
        const formData = new FormData();
        formData.append('filename', file.name);
        formData.append('folder', 'competition-applications');
        formData.append('contentType', file.type);

        // Get presigned URL
        const response = await fetch('/api/presigned-url', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { presignedUrl } = await response.json();

        // Upload file
        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });


        const fileUrl = presignedUrl.split('?')[0]; // Extract the URL without query params
        console.log('publicFileUrl',fileUrl);

        const publicFileUrl = "https://cdn.yazarodasi.com/competition-applications/" + fileUrl.split('/').pop();

        // Add to docs state
        setDocs([...docs, {
          id: Date.now(),
          name: file.name,
          url: publicFileUrl,
        }]);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [docs, setDocs, competition.id]
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link
          to={`/competition/${competition.id}`}
          className="text-yo-orange hover:underline"
        >
          ← Back to Competition
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Submit Entry</h1>
        <div className="text-yo-text-secondary mb-6">
          for {competition.title} by{' '}
          {companyProfile?.name || competition.company.name}
        </div>
<Form method="post" className="space-y-6">
  <div className="space-y-4">
    <div id="docs">
      <Label className="text-sm font-medium">Documents</Label>
      <div className="text-sm text-gray-500 mb-2">
        Upload your PDF documents for submission
      </div>
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="relative mb-4 p-4 border rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center">
            <input type="hidden" name="docs[]" value={doc.url} />
            <span className="text-sm">{doc.name}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDocs(docs.filter((d) => d.id !== doc.id))}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <Label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          {uploading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </div>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </>
          )}
        </Label>
      </div>
    </div>
    
    {actionData?.error && (
      <p className="text-red-500 text-sm">{actionData.error}</p>
    )}

    <Button
      type="submit"
      className="w-full bg-yo-orange hover:bg-yo-orange/90"
    >
      Submit Entry
    </Button>
  </div>
</Form>
      </div>
    </div>
  );
}
