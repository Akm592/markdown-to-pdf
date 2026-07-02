import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { EditorHandle } from './editorHandle';

interface MobileEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Lightweight textarea editor used on small / touch screens instead of Monaco.
// A plain textarea gives far better touch typing, native selection handling,
// and avoids loading the heavy Monaco bundle on phones. font-size is kept at
// 16px so iOS Safari does not auto-zoom when the field is focused.
const MobileEditor = forwardRef<EditorHandle, MobileEditorProps>(
  ({ value, onChange }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(ref, () => ({
      insert: (text: string) => {
        const el = textareaRef.current;
        if (!el) {
          onChange(value + text);
          return;
        }
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        const next = value.slice(0, start) + text + value.slice(end);
        onChange(next);
        // Restore caret just after the inserted snippet on the next frame,
        // once React has committed the new value.
        const caret = start + text.length;
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(caret, caret);
        });
      },
    }));

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder="Write your markdown here..."
        className="h-full w-full resize-none border-0 bg-white dark:bg-gray-800 p-4 font-mono leading-relaxed text-gray-800 dark:text-gray-100 outline-none focus:ring-0 placeholder:text-gray-400"
        style={{ fontSize: '16px' }}
      />
    );
  }
);

MobileEditor.displayName = 'MobileEditor';

export default MobileEditor;
