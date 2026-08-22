import { lazy, memo, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import CodeBlock from './CodeBlock';
import Admonition from './Admonition';
import MermaidLoading from './MermaidLoading';
import { remarkPlugins } from '../lib/markdownPlugins';
import 'katex/dist/katex.min.css';

// mermaid pulls in cytoscape and a chunk per diagram type -- well over 1MB that
// most documents never need. Loading it on first use keeps it out of the
// initial bundle entirely.
const Mermaid = lazy(() => import('./Mermaid'));

interface MarkdownDocumentProps {
  content: string;
}

// Shared markdown renderer used by both the on-screen Preview and the
// fixed-width PrintDocument, so the plugin config and component overrides
// stay in exactly one place.
const MarkdownDocument = ({ content }: MarkdownDocumentProps) => {
  return (
    <article className="prose prose-slate max-w-none
      prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
      prose-h1:text-3xl prose-h1:mb-6 prose-h1:pb-3 prose-h1:border-b prose-h1:border-slate-200
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
      prose-p:leading-relaxed prose-p:text-slate-700
      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-slate-900
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
      prose-ul:my-4 prose-li:my-1 prose-li:text-slate-700
      prose-hr:border-slate-200
      prose-pre:p-0 prose-pre:bg-transparent prose-pre:overflow-visible
    ">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Admonition component for callouts
          // @ts-expect-error - custom element injected by remarkAdmonitions
          admonition({ type, title, children }) {
            return (
              <Admonition type={type || 'note'} title={title}>
                {children}
              </Admonition>
            );
          },
          // Code blocks and inline code
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isMermaid = match && match[1] === 'mermaid';

            // Mermaid diagrams
            if (isMermaid) {
              return (
                <Suspense fallback={<MermaidLoading />}>
                  <Mermaid chart={String(children).replace(/\n$/, '')} />
                </Suspense>
              );
            }

            // Check if inline code
            const isInline = !match && !String(children).includes('\n');

            return (
              <CodeBlock className={className} inline={isInline} {...props}>
                {children}
              </CodeBlock>
            );
          },
          // Pre tag - remove default styling
          pre({ children }) {
            return <div className="not-prose">{children}</div>;
          },
          // Enhanced table rendering
          table({ children }) {
            return (
              <div className="my-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-slate-50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b-2 border-slate-200">
                {children}
              </th>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
          },
          tr({ children }) {
            return (
              <tr className="bg-white hover:bg-slate-50 transition-colors">
                {children}
              </tr>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-sm text-slate-600">
                {children}
              </td>
            );
          },
          // Enhanced blockquote
          blockquote({ children }) {
            return (
              <blockquote className="my-4 border-l-4 border-blue-500 bg-blue-50 py-3 px-4 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          // Horizontal rule
          hr() {
            return <hr className="my-8 border-t-2 border-slate-200" />;
          },
          // Images
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                className="rounded-lg shadow-md max-w-full h-auto my-4"
                style={{ maxWidth: '100%' }}
              />
            );
          },
          // Checkbox for task lists
          input({ type, checked, ...props }) {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

// Re-parsing and re-rendering the whole document is the dominant cost on the
// typing path, and this component is mounted twice (preview + print target).
export default memo(MarkdownDocument);
