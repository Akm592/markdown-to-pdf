// Kept in its own module so <MarkdownDocument> can use it as the Suspense
// fallback without eagerly importing Mermaid.tsx -- which would pull the
// mermaid bundle back into the main chunk and undo the code split.
const MermaidLoading = () => (
  <div className="my-4 p-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
    <div className="flex items-center gap-3 text-slate-500">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Rendering diagram...</span>
    </div>
  </div>
);

export default MermaidLoading;
