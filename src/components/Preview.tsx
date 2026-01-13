import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './Mermaid';

interface PreviewProps {
  content: string;
  theme?: 'light' | 'dark';
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, theme = 'light' }, ref) => {
  return (
    <div className="h-full w-full overflow-auto bg-gray-100 dark:bg-gray-900 p-8 flex justify-center print:p-0 print:bg-white print:block transition-colors duration-200">
        <div 
            ref={ref}
            className="min-h-[29.7cm] w-[21cm] bg-white dark:bg-gray-800 p-[2cm] shadow-lg print:shadow-none print:w-full print:min-h-0 print:p-0 print:m-0 mx-auto transition-colors duration-200"
        >
            <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isMermaid = match && match[1] === 'mermaid';
                      
                      if (isMermaid) {
                        return <Mermaid chart={String(children).replace(/\n$/, '')} theme={theme} />;
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                    {content}
                </ReactMarkdown>
            </article>
        </div>
    </div>
  );
});

export default Preview;
