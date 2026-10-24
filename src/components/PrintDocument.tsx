import { forwardRef, memo } from 'react';
import MarkdownDocument from './MarkdownDocument';

interface PrintDocumentProps {
  content: string;
}

// Dedicated print target, rendered at a FIXED A4 printable width (210mm page
// - 2*20mm margins = 170mm) regardless of screen size, and parked off-screen
// (laid out, NOT display:none) so react-to-print can clone real dimensions and
// Mermaid/KaTeX render at a non-zero width.
//
// Two separate elements on purpose:
//   .print-host      carries the off-screen positioning and is NEVER cloned
//   .print-document  is what `ref` points at, so the node react-to-print clones
//                    is a plain, position-static, fixed-width block
//
// Cloning a `position: fixed; left: -10000px` node meant the printed output
// depended on a @media print override landing inside the iframe to drag it
// back on-page. Keeping the ref'd node unpositioned removes that dependency.
const PrintDocument = forwardRef<HTMLDivElement, PrintDocumentProps>(({ content }, ref) => {
  return (
    <div className="print-host" aria-hidden="true">
      <div
        ref={ref}
        className="print-document"
        style={{
          width: '170mm',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        <MarkdownDocument content={content} />
      </div>
    </div>
  );
});

PrintDocument.displayName = 'PrintDocument';

// App feeds this a debounced copy of the document, but memoising as well means
// unrelated App re-renders (theme, title, tab switches) never re-render the
// entire second copy of the document.
export default memo(PrintDocument);
