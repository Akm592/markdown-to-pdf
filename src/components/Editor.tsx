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
    // Custom dark theme matching the app
    monaco.editor.defineTheme('md-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'a78bfa' },
        { token: 'string', foreground: '34d399' },
      ],
      colors: {
        'editor.background': '#1f2937',
        'editor.foreground': '#e5e7eb',
        'editorLineNumber.foreground': '#6b7280',
        'editorLineNumber.activeForeground': '#9ca3af',
        'editor.lineHighlightBackground': '#374151',
        'editor.selectionBackground': '#3b82f640',
        'editorCursor.foreground': '#3b82f6',
      },
    });
    
    // Custom light theme
    monaco.editor.defineTheme('md-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1f2937',
        'editorLineNumber.foreground': '#9ca3af',
        'editorLineNumber.activeForeground': '#6b7280',
        'editor.lineHighlightBackground': '#f3f4f6',
        'editor.selectionBackground': '#3b82f630',
        'editorCursor.foreground': '#3b82f6',
      },
    });

    // Apply theme
    monaco.editor.setTheme(theme === 'dark' ? 'md-dark' : 'md-light');
    
    if (onEditorMount) {
      onEditorMount(editor, monaco);
    }
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'md-dark' : 'md-light'}
        loading={
          <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 gap-3">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading Editor...</span>
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 1.6,
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          guides: {
            indentation: true,
            bracketPairs: true,
          },
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default MarkdownEditor;
