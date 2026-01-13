import { useState, type FC, type ReactNode } from 'react';
import hljs from 'highlight.js';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  className?: string;
  children: ReactNode;
  inline?: boolean;
}

const CodeBlock: FC<CodeBlockProps> = ({ className, children, inline }) => {
  const [copied, setCopied] = useState(false);
  
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  // Inline code - always light background for readability
  if (inline || !match) {
    return (
      <code className="px-1.5 py-0.5 text-sm font-mono bg-slate-100 text-pink-600 rounded border border-slate-200">
        {children}
      </code>
    );
  }

  // Syntax highlight
  let highlightedCode = code;
  try {
    if (language && hljs.getLanguage(language)) {
      highlightedCode = hljs.highlight(code, { language }).value;
    } else {
      highlightedCode = hljs.highlightAuto(code).value;
    }
  } catch {
    // Fallback to plain code
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ALWAYS use light background for code blocks - like a real document
  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-white max-w-full">
      {/* Header with language badge - light gray */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-all opacity-0 group-hover:opacity-100 print:hidden"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content - ALWAYS white background */}
      <div className="overflow-x-auto bg-white">
        <pre className="p-4 m-0 bg-white text-sm overflow-x-auto">
          <code
            className={`hljs language-${language} font-mono leading-relaxed text-slate-800`}
            style={{ background: 'transparent' }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
