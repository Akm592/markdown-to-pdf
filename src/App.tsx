import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { type editor } from 'monaco-editor';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import MarkdownEditor from './components/Editor';
import Preview from './components/Preview';
import useLocalStorage from './hooks/useLocalStorage';
import Layout from './components/Layout';
import { ErrorFallback } from './components/ErrorBoundary';

const DEFAULT_MARKDOWN = `# Welcome to Markdown2PDF ✨

A beautiful, production-ready markdown editor with live preview and PDF export.

---

## Features

- **Live Preview**: See your changes instantly
- **Syntax Highlighting**: Beautiful code blocks with copy-to-clipboard
- **Mermaid Diagrams**: Flowcharts, sequences, and more
- **Dark Mode**: Easy on the eyes
- **PDF Export**: High-quality output with proper styling
- **Local Storage**: Your work is automatically saved

---

## Code Examples

### JavaScript

\`\`\`javascript
function greet(name) {
  const greeting = \`Hello, \${name}!\`;
  console.log(greeting);
  return greeting;
}

// Call the function
greet("World");
\`\`\`

### Python

\`\`\`python
def fibonacci(n):
    """Generate Fibonacci sequence up to n."""
    a, b = 0, 1
    while a < n:
        yield a
        a, b = b, a + b

# Print first 10 Fibonacci numbers
for num in fibonacci(100):
    print(num, end=" ")
\`\`\`

---

## Tables

| Feature | Status | Priority |
| --- | --- | --- |
| Live Preview | ✅ Completed | High |
| PDF Export | ✅ Completed | High |
| Syntax Highlighting | ✅ Completed | Medium |
| Mermaid Diagrams | ✅ Completed | Medium |
| Dark Mode | ✅ Completed | Low |

---

## Mermaid Diagrams

### Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Ship it! 🚀]
\`\`\`

---

## Blockquotes

> 💡 **Pro Tip**: Use the toolbar above to quickly insert markdown elements like headings, lists, tables, and even Mermaid diagrams!

---

## Task Lists

- [x] Create markdown editor
- [x] Add live preview
- [x] Implement PDF export
- [x] Add syntax highlighting
- [ ] Share with the world

---

## Inline Formatting

You can use **bold**, *italic*, ~~strikethrough~~, and \`inline code\` within your text. You can also add [links](https://github.com) to external resources.

---

*Made with ❤️ by Ashish*
`;

function App() {
  const [markdown, setMarkdown] = useLocalStorage<string>('md_content', DEFAULT_MARKDOWN);
  const [title, setTitle] = useLocalStorage<string>('md_title', 'Untitled Document');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('md_theme', 'light');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
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
    onAfterPrint: () => toast.success('PDF exported successfully!'),
    onPrintError: () => toast.error('Failed to export PDF'),
  });

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleInsert = (template: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const text = template;
      const op = {range: selection!, text: text, forceMoveMarkers: true};
      editorRef.current.executeEdits("my-source", [op]);
      editorRef.current.focus();
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setMarkdown('');
      toast.info('Document cleared');
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Layout>
        <div className="h-screen flex flex-col overflow-hidden">
          <Header 
            title={title} 
            setTitle={setTitle} 
            onReset={handleReset} 
            onExport={() => handlePrint && handlePrint()} 
            theme={theme}
            toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
          
          {/* Mobile Tabs */}
          <div className="sm:hidden flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button 
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                activeTab === 'editor' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                activeTab === 'preview' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
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
              <Preview content={markdown} ref={previewRef} theme={theme} />
            </div>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
