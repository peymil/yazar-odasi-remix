import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PostEditorProps {
  companies?: Array<{ id: number; name: string }>;
  onSubmit: (data: { content: string; companyId?: number }) => void;
  isSubmitting?: boolean;
}

export function PostEditor({ companies, onSubmit, isSubmitting }: PostEditorProps) {
  const [content, setContent] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    onSubmit({
      content,
      companyId: selectedCompanyId ? parseInt(selectedCompanyId) : undefined
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(value) => setContent(value || '')}
          preview="edit"
          height={400}
        />
      </div>
      
      <div className="flex items-center gap-4">
        {companies && companies.length > 0 && (
          <Select
            value={selectedCompanyId}
            onValueChange={setSelectedCompanyId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Post as..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Personal Post</SelectItem>
              {companies.map((company) => (
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
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
}
