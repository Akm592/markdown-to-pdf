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

const DEFAULT_MARKDOWN = `# Welcome to Markdown2PDF :rocket:

A beautiful, production-ready markdown editor with **universal markdown support**.

---

## Features

- :white_check_mark: **Live Preview**: See your changes instantly
- :white_check_mark: **Syntax Highlighting**: Beautiful code blocks with copy-to-clipboard
- :white_check_mark: **Mermaid Diagrams**: Flowcharts, sequences, and more
- :white_check_mark: **Math Equations**: LaTeX-style math with KaTeX
- :white_check_mark: **Admonitions**: Note, tip, warning, and danger callouts
- :white_check_mark: **Emoji Support**: Use :emoji: shortcodes
- :white_check_mark: **PDF Export**: High-quality output with proper styling

---

## Math Equations :books:

Inline math: $E = mc^2$ and $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

The quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

---

## Admonitions / Callouts

:::note
This is a **note** callout. Use it for general information.
:::

:::tip
This is a **tip** callout. Use it for helpful suggestions.
:::

:::info
This is an **info** callout. Use it for informational highlights.
:::

:::warning
This is a **warning** callout. Use it for important cautions.
:::

:::danger
This is a **danger** callout. Use it for critical warnings.
:::

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
| Live Preview | :white_check_mark: Completed | High |
| PDF Export | :white_check_mark: Completed | High |
| Math Support | :white_check_mark: Completed | Medium |
| Admonitions | :white_check_mark: Completed | Medium |

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

> :bulb: **Pro Tip**: Use the toolbar above to quickly insert markdown elements like headings, lists, tables, and even Mermaid diagrams!

---

## Task Lists

- [x] Create markdown editor
- [x] Add live preview
- [x] Implement PDF export
- [x] Add math equations support
- [x] Add admonitions/callouts
- [ ] Share with the world :earth_americas:

---

## Inline Formatting

You can use **bold**, *italic*, ~~strikethrough~~, and \`inline code\` within your text. You can also add [links](https://github.com) to external resources.

Emojis: :smile: :heart: :rocket: :fire: :star: :thumbsup:

---

*Made with :heart: by Ashish*
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
