import '@mdxeditor/editor/style.css'
import { MDXEditor, headingsPlugin, linkPlugin, imagePlugin, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, linkDialogPlugin, CreateLink, InsertImage } from '@mdxeditor/editor'
import { ClientOnly } from 'remix-utils/client-only'

interface MDXEditorComponentProps {
  content: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MDXEditorComponent({ content, onChange, className = '' }: MDXEditorComponentProps) {
  return (
    <MDXEditor
      markdown={content}
      plugins={[headingsPlugin(),linkPlugin(),linkDialogPlugin(), imagePlugin(), toolbarPlugin({
        toolbarClassName: 'my-classname',
        toolbarContents: () => (
          <>
            {' '}
            <UndoRedo />
            <BoldItalicUnderlineToggles />
            <CreateLink />
            <InsertImage />
          </>
        )
      })]}
      onChange={(value) => onChange(value || '')}
    />
  );
}
