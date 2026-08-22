import { useEffect, useRef, useState, type FC } from 'react';
import { ChevronDown, Download, FileCode, FileText, FileType2, Loader2 } from 'lucide-react';

export interface ExportMenuProps {
  onExportPdf: () => void;
  onExportDocx: () => void;
  onExportMarkdown: () => void;
  /** True while the DOCX chunk is downloading or the document is being built. */
  isExportingDocx: boolean;
}

const ExportMenu: FC<ExportMenuProps> = ({
  onExportPdf,
  onExportDocx,
  onExportMarkdown,
  isExportingDocx,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = [
    { label: 'PDF', hint: 'Print dialog', icon: FileText, action: onExportPdf, busy: false },
    { label: 'Word', hint: '.docx', icon: FileType2, action: onExportDocx, busy: isExportingDocx },
    { label: 'Markdown', hint: '.md', icon: FileCode, action: onExportMarkdown, busy: false },
  ];

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, [open]);

  const focusSibling = (offset: number) => {
    const options = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []
    );
    if (!options.length) return;
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    const next = (current + offset + options.length) % options.length;
    options[next]?.focus();
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusSibling(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusSibling(-1);
    }
  };

  const select = (action: () => void) => {
    close();
    action();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        {isExportingDocx ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Export format"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 mt-2 w-52 origin-top-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50 p-1 animate-fadeIn"
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              disabled={item.busy}
              onClick={() => select(item.action)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {item.busy ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-blue-600" />
              ) : (
                <item.icon className="w-4 h-4 shrink-0 text-gray-400" />
              )}
              <span className="font-medium">{item.label}</span>
              <span className="ml-auto text-xs text-gray-400">{item.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
