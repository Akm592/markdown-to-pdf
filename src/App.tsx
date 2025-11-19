import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import MarkdownEditor from './components/Editor';
import Preview from './components/Preview';
import useLocalStorage from './hooks/useLocalStorage';

const DEFAULT_MARKDOWN = `# Welcome to Markdown2PDF

Start typing to see the magic happen!

## Features
- **Live Preview**: See changes instantly
- **Export to PDF**: High quality output
- **Dark Mode**: Easy on the eyes
- **Local Storage**: Never lose your work

## Code Example
\`\`\`javascript
console.log("Hello World");
\`\`\`

## Table
| Feature | Status |
| --- | --- |
| PDF Export | ✅ |
| Dark Mode | ✅ |
`;

function App() {
  const [markdown, setMarkdown] = useLocalStorage<string>('md_content', DEFAULT_MARKDOWN);
  const [title, setTitle] = useLocalStorage<string>('md_title', 'Untitled Document');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('md_theme', 'light');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  
  const editorRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: title,
  });

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleInsert = (template: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const text = template;
      const op = {range: selection, text: text, forceMoveMarkers: true};
      editorRef.current.executeEdits("my-source", [op]);
      editorRef.current.focus();
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setMarkdown('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Header 
        title={title} 
        setTitle={setTitle} 
        onReset={handleReset} 
        onExport={() => handlePrint && handlePrint()} 
        theme={theme}
        toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
      
      {/* Mobile Tabs */}
      <div className="sm:hidden flex border-b border-gray-200 dark:border-gray-700">
        <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'editor' ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            onClick={() => setActiveTab('editor')}
        >
            Editor
        </button>
        <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            onClick={() => setActiveTab('preview')}
        >
            Preview
        </button>
      </div>
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Pane */}
        <div className={`flex flex-col h-full ${activeTab === 'editor' ? 'w-full' : 'hidden'} sm:w-1/2 sm:flex border-r border-gray-200 dark:border-gray-700`}>
          <Toolbar onInsert={handleInsert} />
          <div className="flex-1 overflow-hidden">
            <MarkdownEditor 
              value={markdown} 
              onChange={(val) => setMarkdown(val || '')} 
              theme={theme}
              onEditorMount={handleEditorMount}
            />
          </div>
        </div>

        {/* Preview Pane */}
        <div className={`h-full bg-gray-100 dark:bg-gray-900 ${activeTab === 'preview' ? 'w-full' : 'hidden'} sm:w-1/2 sm:block`}>
          <Preview content={markdown} ref={previewRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
