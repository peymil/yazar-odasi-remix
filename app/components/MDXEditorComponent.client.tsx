import '@mdxeditor/editor/style.css';
import {
  MDXEditor,
  headingsPlugin,
  linkPlugin,
  imagePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  linkDialogPlugin,
  CreateLink,
  InsertImage,
} from '@mdxeditor/editor';

interface MDXEditorComponentProps {
  content: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MDXEditorComponent({
  content,
  onChange,
  className = '',
}: MDXEditorComponentProps) {
  return (
    <MDXEditor
      markdown={content}
      plugins={[
        headingsPlugin(),
        imagePlugin(),
        toolbarPlugin({
          toolbarClassName: 'my-classname',
          toolbarContents: () => (
            <>
              {' '}
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <InsertImage />
            </>
          ),
        }),
      ]}
      onChange={(value) => onChange(value || '')}
    />
  );
}
