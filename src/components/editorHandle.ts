// Shared imperative handle so the toolbar can insert markdown snippets into
// whichever editor is currently mounted (Monaco on desktop, textarea on mobile).
export interface EditorHandle {
  insert: (text: string) => void;
}
