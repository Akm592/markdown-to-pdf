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
    <div className="flex items-center space-x-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto print:hidden">
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={() => onInsert(tool.template)}
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded transition-colors"
          title={tool.label}
        >
          <tool.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
