import { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { flushSync } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import MarkdownEditor from './components/Editor';
import MobileEditor from './components/MobileEditor';
import Preview from './components/Preview';
import PrintDocument from './components/PrintDocument';
import type { EditorHandle } from './components/editorHandle';
import useLocalStorage from './hooks/useLocalStorage';
import useMediaQuery from './hooks/useMediaQuery';
import useDebouncedValue from './hooks/useDebouncedValue';
import Layout from './components/Layout';
import { ErrorFallback } from './components/ErrorBoundary';
import { downloadBlob, toFilename } from './lib/download';

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
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // The preview can lag a keystroke behind without anyone noticing; the
  // off-screen print target can lag much further, since it is only read when
  // an export actually happens. Both keep typing off the critical path.
  const previewMarkdown = useDeferredValue(markdown);
  const [printMarkdown, flushPrintMarkdown] = useDebouncedValue(markdown, 400);

  // Use Monaco on >= sm screens, the lightweight textarea editor below that.
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const editorHandleRef = useRef<EditorHandle>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
    // The print target trails the editor by up to 400ms. react-to-print clones
    // the live DOM, so force it up to date first or a fast "type then export"
    // would silently print the previous revision.
    onBeforePrint: () => {
      flushSync(() => flushPrintMarkdown());
      return Promise.resolve();
    },
    onAfterPrint: () => toast.success('PDF exported successfully!'),
    onPrintError: () => toast.error('Failed to export PDF'),
  });

  const handleInsert = (template: string) => {
    editorHandleRef.current?.insert(template);
  };

  // The DOCX writer, the LaTeX converter and the mermaid rasteriser are all
  // loaded on demand so they stay out of the initial bundle.
  const handleExportDocx = useCallback(async () => {
    setIsExportingDocx(true);
    try {
      const { exportDocx } = await import('./lib/exportDocx');
      await exportDocx(markdown, title);
      toast.success('Word document exported');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export Word document');
    } finally {
      setIsExportingDocx(false);
    }
  }, [markdown, title]);

  const handleExportMarkdown = useCallback(() => {
    downloadBlob(
      new Blob([markdown], { type: 'text/markdown;charset=utf-8' }),
      toFilename(title, 'md')
    );
    toast.success('Markdown file downloaded');
  }, [markdown, title]);

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
            onExportPdf={handlePrint}
            onExportDocx={handleExportDocx}
            onExportMarkdown={handleExportMarkdown}
            isExportingDocx={isExportingDocx}
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
                {isDesktop ? (
                  <MarkdownEditor
                    ref={editorHandleRef}
                    value={markdown}
                    onChange={(val) => setMarkdown(val || '')}
                    theme={theme}
                  />
                ) : (
                  <MobileEditor
                    ref={editorHandleRef}
                    value={markdown}
                    onChange={(val) => setMarkdown(val)}
                  />
                )}
              </div>
            </div>

            {/* Preview Pane */}
            <div className={`h-full bg-gray-100 dark:bg-gray-900 ${activeTab === 'preview' ? 'w-full' : 'hidden'} sm:w-1/2 sm:block`}>
              <Preview content={previewMarkdown} />
            </div>
          </div>
        </div>

        {/* Off-screen fixed-width A4 render used as the print/export target */}
        <PrintDocument content={printMarkdown} ref={printRef} />
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
