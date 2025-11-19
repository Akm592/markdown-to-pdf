import { type FC } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

interface EditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  theme?: 'light' | 'dark';
  onEditorMount?: OnMount;
}

const MarkdownEditor: FC<EditorProps> = ({ value, onChange, theme = 'light', onEditorMount }) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // You can configure the editor here
    monaco.editor.defineTheme('my-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1f2937', // Tailwind gray-800
      },
    });
    
    if (onEditorMount) {
        onEditorMount(editor, monaco);
    }
  };

  return (
    <div className="h-full w-full border-r border-gray-200 dark:border-gray-700">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: 'Fira Code, monospace',
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default MarkdownEditor;
