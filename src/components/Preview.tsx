import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './Mermaid';
import CodeBlock from './CodeBlock';

interface PreviewProps {
  content: string;
  theme?: 'light' | 'dark';
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, theme = 'light' }, ref) => {
  return (
    // ALWAYS light background for preview - matches PDF export
    <div className="h-full w-full overflow-auto p-4 sm:p-8 flex justify-center print:p-0 print:bg-white print:block" style={{ backgroundColor: '#f1f5f9' }}>
      {/* Paper container - overflow-x-hidden prevents horizontal overflow, vertical content is visible */}
      <div 
        ref={ref}
        className="min-h-[29.7cm] w-full max-w-[21cm] bg-white p-6 sm:p-[2cm] shadow-lg rounded-sm overflow-x-hidden print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:m-0 print:rounded-none print:overflow-visible mx-auto"
        style={{ backgroundColor: '#ffffff', boxSizing: 'border-box' }}
      >
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
            remarkPlugins={[remarkGfm]}
            components={{
              // Code blocks and inline code
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isMermaid = match && match[1] === 'mermaid';
                
                // Mermaid diagrams
                if (isMermaid) {
                  return <Mermaid chart={String(children).replace(/\n$/, '')} theme={theme} />;
                }

                // Check if inline code (no language specified and short content)
                const isInline = !match && !String(children).includes('\n');

                // Use CodeBlock for all code
                return (
                  <CodeBlock className={className} inline={isInline} {...props}>
                    {children}
                  </CodeBlock>
                );
              },
              // Pre tag - remove default styling since CodeBlock handles it
              pre({ children }) {
                return <div className="not-prose">{children}</div>;
              },
              // Enhanced table rendering - ALWAYS light backgrounds
              table({ children }) {
                return (
                  <div className="my-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full border-collapse">{children}</table>
                  </div>
                );
              },
              thead({ children }) {
                return (
                  <thead className="bg-slate-50">
                    {children}
                  </thead>
                );
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
              // Horizontal rule with styling
              hr() {
                return <hr className="my-8 border-t-2 border-slate-200" />;
              },
              // Images with proper styling - constrain width
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
              // Checkbox styling for task lists
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
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
