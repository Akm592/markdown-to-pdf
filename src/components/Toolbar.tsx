import { type FC } from 'react';
import { 
  Bold, Italic, Heading, Code, Link, List, Table, 
  Quote, Strikethrough, CheckSquare, ListOrdered, Image, GitBranch
} from 'lucide-react';

interface ToolbarProps {
  onInsert: (template: string) => void;
}

interface ToolItem {
  icon: typeof Bold;
  label: string;
  template: string;
  shortcut?: string;
}

const Toolbar: FC<ToolbarProps> = ({ onInsert }) => {
  const formattingTools: ToolItem[] = [
    { icon: Bold, label: 'Bold', template: '**bold text**', shortcut: 'Ctrl+B' },
    { icon: Italic, label: 'Italic', template: '_italic text_', shortcut: 'Ctrl+I' },
    { icon: Strikethrough, label: 'Strikethrough', template: '~~strikethrough~~' },
    { icon: Code, label: 'Inline Code', template: '`code`' },
  ];

  const blockTools: ToolItem[] = [
    { icon: Heading, label: 'Heading', template: '\n## Heading\n' },
    { icon: Quote, label: 'Blockquote', template: '\n> Quote text\n' },
    { icon: List, label: 'Bullet List', template: '\n- List item\n- List item\n- List item\n' },
    { icon: ListOrdered, label: 'Numbered List', template: '\n1. First item\n2. Second item\n3. Third item\n' },
    { icon: CheckSquare, label: 'Task List', template: '\n- [ ] Task item\n- [x] Completed task\n' },
  ];

  const insertTools: ToolItem[] = [
    { icon: Link, label: 'Link', template: '[link text](https://example.com)' },
    { icon: Image, label: 'Image', template: '![alt text](https://example.com/image.png)' },
    { icon: Table, label: 'Table', template: '\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n' },
    { icon: GitBranch, label: 'Mermaid Diagram', template: '\n```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Do Something]\n    B -->|No| D[Do Something Else]\n    C --> E[End]\n    D --> E\n```\n' },
  ];

  const ToolButton = ({ tool }: { tool: ToolItem }) => (
    <div className="relative group">
      <button
        onClick={() => onInsert(tool.template)}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-md transition-all duration-150 active:scale-95"
        title={tool.label}
      >
        <tool.icon className="w-4.5 h-4.5" />
        <span className="sr-only">{tool.label}</span>
      </button>
      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-lg">
        <span>{tool.label}</span>
        {tool.shortcut && (
          <span className="ml-2 text-gray-400 text-[10px]">{tool.shortcut}</span>
        )}
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
      </div>
    </div>
  );

  const Divider = () => (
    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1.5" />
  );

  return (
    <div className="flex items-center gap-0.5 px-3 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto print:hidden shadow-sm">
      {/* Formatting Tools */}
      <div className="flex items-center gap-0.5">
        {formattingTools.map((tool) => (
          <ToolButton key={tool.label} tool={tool} />
        ))}
      </div>
      
      <Divider />
      
      {/* Block Tools */}
      <div className="flex items-center gap-0.5">
        {blockTools.map((tool) => (
          <ToolButton key={tool.label} tool={tool} />
        ))}
      </div>
      
      <Divider />
      
      {/* Insert Tools */}
      <div className="flex items-center gap-0.5">
        {insertTools.map((tool) => (
          <ToolButton key={tool.label} tool={tool} />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
