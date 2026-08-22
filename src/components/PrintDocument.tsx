import { forwardRef, memo } from 'react';
import MarkdownDocument from './MarkdownDocument';

interface PrintDocumentProps {
  content: string;
}

// Dedicated print target. It is rendered at a FIXED A4 printable width
// (210mm page - 2*20mm margins = 170mm) regardless of the screen size, and
// positioned off-screen (but still laid out - NOT display:none) so that
// react-to-print can clone real dimensions and Mermaid/KaTeX render at a
// non-zero width. Pointing the print action at this element makes the
// exported PDF identical on mobile and desktop instead of inheriting the
// phone's narrow viewport width.
const PrintDocument = forwardRef<HTMLDivElement, PrintDocumentProps>(({ content }, ref) => {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="print-document"
      style={{
        width: '170mm',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      <MarkdownDocument content={content} />
    </div>
  );
});

PrintDocument.displayName = 'PrintDocument';

// App feeds this a debounced copy of the document, but memoising as well means
// unrelated App re-renders (theme, title, tab switches) never re-render the
// entire second copy of the document.
export default memo(PrintDocument);
