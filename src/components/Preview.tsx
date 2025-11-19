import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewProps {
  content: string;
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content }, ref) => {
  return (
    <div className="h-full w-full overflow-auto bg-gray-100 p-8 dark:bg-gray-900 flex justify-center print:p-0 print:bg-white print:block">
        <div 
            ref={ref}
            className="min-h-[29.7cm] w-[21cm] bg-white p-[2cm] shadow-lg print:shadow-none print:w-full print:min-h-0 print:p-0 print:m-0 mx-auto"
        >
            <article className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </article>
        </div>
    </div>
  );
});

export default Preview;
