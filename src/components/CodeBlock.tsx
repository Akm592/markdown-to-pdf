import { useMemo, useState, type FC, type ReactNode } from 'react';
import hljs from 'highlight.js/lib/core';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

// Explicit language registration instead of the full highlight.js bundle,
// which ships ~190 grammars (~800kB) to render a handful. Unregistered
// languages fall back to plain text rather than being auto-detected.
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

const LANGUAGES = {
  bash, c, cpp, csharp, css, go, java, javascript, json, markdown,
  php, python, ruby, rust, sql, typescript, xml, yaml,
};

for (const [name, definition] of Object.entries(LANGUAGES)) {
  hljs.registerLanguage(name, definition);
}

// Common aliases people actually type in fences.
hljs.registerAliases(['js', 'jsx', 'mjs'], { languageName: 'javascript' });
hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' });
hljs.registerAliases(['py'], { languageName: 'python' });
hljs.registerAliases(['sh', 'shell', 'zsh'], { languageName: 'bash' });
hljs.registerAliases(['html', 'svg'], { languageName: 'xml' });
hljs.registerAliases(['yml'], { languageName: 'yaml' });
hljs.registerAliases(['rb'], { languageName: 'ruby' });
hljs.registerAliases(['cs'], { languageName: 'csharp' });

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

  // Highlighting is the most expensive thing on the render path and runs for
  // every block in both the preview and the off-screen print document, so it
  // is cached against the only inputs that can change the result.
  const highlightedCode = useMemo(() => {
    if (!language || !hljs.getLanguage(language)) return null;
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      return null;
    }
  }, [code, language]);

  // Inline code - always light background for readability
  if (inline) {
    return (
      <code className="px-1.5 py-0.5 text-sm font-mono bg-slate-100 text-pink-600 rounded border border-slate-200">
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API is unavailable on insecure origins and can be blocked by
      // permissions policy -- say so instead of leaving the button inert.
      toast.error('Could not copy to clipboard');
    }
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
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 print:hidden"
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
          {highlightedCode === null ? (
            <code className="hljs font-mono leading-relaxed text-slate-800" style={{ background: 'transparent' }}>
              {code}
            </code>
          ) : (
            <code
              className={`hljs language-${language} font-mono leading-relaxed text-slate-800`}
              style={{ background: 'transparent' }}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
