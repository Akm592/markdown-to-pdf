import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  theme?: 'light' | 'dark';
}

const Mermaid = ({ chart, theme = 'light' }: MermaidProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Re-initialize for theme changes
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Fira Code, monospace',
      suppressErrorRendering: true, // IMPORTANT: Stop mermaid from hijacking the DOM
    });

    const render = async () => {
      if (containerRef.current) {
        try {
          // 1. Validate syntax first
          await mermaid.parse(chart);
          
          // 2. If valid, render
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
          setError(null);
        } catch (err: any) {
          console.error('Mermaid Error:', err);
          // 3. Set custom error message
          // Mermaid errors can be objects or strings, let's try to extract a friendly message
          let msg = "Syntax error in graph";
          if (err instanceof Error) msg = err.message;
          else if (typeof err === 'string') msg = err;
          // Clean up the generic parser error prefix if possible
          setError(msg);
        }
      }
    };

    render();
  }, [chart, theme]);

  if (error) {
     return (
        <div className="my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
           <div className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Diagram Syntax Error</div>
           <pre className="text-xs text-red-500 dark:text-red-300 font-mono whitespace-pre-wrap overflow-auto max-h-32">
              {error}
           </pre>
        </div>
     );
  }

  return (
    <div 
      className="mermaid flex justify-center my-4" 
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default Mermaid;
