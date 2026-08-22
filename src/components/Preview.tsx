import MarkdownDocument from './MarkdownDocument';

interface PreviewProps {
  content: string;
}

const Preview = ({ content }: PreviewProps) => {
  return (
    // ALWAYS light background for preview - matches PDF export
    <div className="h-full w-full overflow-auto p-4 sm:p-8 flex justify-center print:p-0 print:bg-white print:block" style={{ backgroundColor: '#f1f5f9' }}>
      {/* Paper container - overflow-x-hidden prevents horizontal overflow */}
      <div
        className="min-h-[29.7cm] w-full max-w-[21cm] bg-white p-6 sm:p-[2cm] shadow-lg rounded-sm overflow-x-hidden print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:m-0 print:rounded-none print:overflow-visible mx-auto"
        style={{ backgroundColor: '#ffffff', boxSizing: 'border-box' }}
      >
        <MarkdownDocument content={content} />
      </div>
    </div>
  );
};

export default Preview;
