import { type FC } from 'react';
import { Download, Moon, Sun, RotateCcw, FileText, Github } from 'lucide-react';

interface HeaderProps {
  title: string;
  setTitle: (title: string) => void;
  onReset: () => void;
  onExport: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: FC<HeaderProps> = ({ title, setTitle, onReset, onExport, theme, toggleTheme }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10 print:hidden">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-blue-600 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-none">Markdown2PDF</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">by Ashish</p>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Document"
          className="w-full px-3 py-1.5 text-center bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200 font-medium transition-colors"
        />
      </div>

      <div className="flex items-center space-x-2">
        <a
          href="https://github.com/Ashish/markdown-to-pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          title="View on GitHub"
        >
          <Github className="w-5 h-5" />
        </a>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

        <button
          onClick={onReset}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors"
          title="Reset Document"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
