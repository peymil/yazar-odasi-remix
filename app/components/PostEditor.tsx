import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { MDXEditorComponent } from '~/components/MDXEditorComponent.client';

export default function PostEditor() {
  const { companies }: { companies: { id: number; name: string }[] } = useLoaderData();
  const [content, setContent] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Implementation for posting
    setIsSubmitting(false);
  };

  return (
    <div className="w-full mx-auto space-y-4 shadow-md p-4 bg-white rounded-lg border">
      <MDXEditorComponent content={content} onChange={setContent} />

      <div className="flex items-center gap-4">
        {companies && companies.length > 0 && (
          <Select
            value={selectedCompanyId}
            onValueChange={setSelectedCompanyId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Şirket olarak paylaş..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Kişisel Gönderi</SelectItem>
              {companies.map((company: { id: number; name: string }) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
        </Button>
      </div>
    </div>
  );
}
