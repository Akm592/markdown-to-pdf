import { type FC } from 'react';
import { Bold, Italic, Heading, Code, Link, List, Table } from 'lucide-react';

interface ToolbarProps {
  onInsert: (template: string) => void;
}

const Toolbar: FC<ToolbarProps> = ({ onInsert }) => {
  const tools = [
    { icon: Bold, label: 'Bold', template: '**bold text**' },
    { icon: Italic, label: 'Italic', template: '_italic text_' },
    { icon: Heading, label: 'Heading', template: '\n# Heading\n' },
    { icon: Code, label: 'Code', template: '`code`' },
    { icon: Link, label: 'Link', template: '[link text](url)' },
    { icon: List, label: 'List', template: '\n- List item' },
    { icon: Table, label: 'Table', template: '\n| Header | Header |\n| --- | --- |\n| Cell | Cell |\n' },
  ];

  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto print:hidden shadow-sm">
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={() => onInsert(tool.template)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-md transition-all duration-200 group relative"
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
          <span className="sr-only">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
