import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  theme?: 'light' | 'dark';
}

// Initialize mermaid once at module level
let mermaidInitialized = false;

const initMermaid = () => {
  if (mermaidInitialized) return;
  
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
    suppressErrorRendering: true,
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
    },
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#93c5fd',
      lineColor: '#6b7280',
      secondaryColor: '#f3f4f6',
      tertiaryColor: '#fef3c7',
      background: '#ffffff',
      mainBkg: '#ffffff',
      nodeBorder: '#d1d5db',
      clusterBkg: '#f9fafb',
      titleColor: '#111827',
      edgeLabelBackground: '#ffffff',
    },
  });
  
  mermaidInitialized = true;
};

const Mermaid = ({ chart }: MermaidProps) => {
  const uniqueId = useId();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initMermaid();
    
    let isMounted = true;
    
    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Validate chart syntax
        await mermaid.parse(chart);
        
        // Generate a valid ID (must start with letter, no special chars)
        const id = `mermaid-${uniqueId.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        // Render the chart
        const result = await mermaid.render(id, chart);
        
        if (isMounted) {
          setSvg(result.svg);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error('Mermaid rendering error:', err);
        
        if (isMounted) {
          let errorMessage = 'Failed to render diagram';
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }
          setError(errorMessage);
          setSvg('');
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(renderDiagram, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-bold text-red-600 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Diagram Error</span>
        </div>
        <pre className="text-xs text-red-500 font-mono whitespace-pre-wrap overflow-auto max-h-32">
          {error}
        </pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-4 p-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Rendering diagram...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 bg-white border border-slate-200 rounded-lg overflow-x-auto">
      <div 
        className="flex justify-center min-w-fit"
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  );
};

export default Mermaid;
