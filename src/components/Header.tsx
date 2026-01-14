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
    <header className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-700/80 shadow-sm z-10 print:hidden">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-40" />
          <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-none">
            Markdown2PDF
          </h1>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">by Ashish</p>
        </div>
      </div>

      {/* Document Title */}
      <div className="flex-1 max-w-xl mx-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Document"
          className="w-full px-4 py-2 text-center bg-gray-50 dark:bg-gray-900/50 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-700 dark:text-gray-200 font-medium transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* GitHub Link */}
        <a
          href="https://github.com/Akm592/markdown-to-pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          title="View on GitHub"
        >
          <Github className="w-5 h-5" />
        </a>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-all group"
          title="Reset Document (Ctrl+Shift+R)"
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
        </button>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:text-gray-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 rounded-lg transition-all"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
