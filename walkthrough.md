# Markdown to PDF Walkthrough

I have successfully built the Markdown-to-PDF application as per your architectural plan.

## Features Implemented

1.  **Technology Stack**:
    *   React (Vite) + TypeScript
    *   Tailwind CSS + @tailwindcss/typography
    *   Monaco Editor for the input
    *   React Markdown + Remark GFM for the preview
    *   React-to-Print for PDF generation
    *   Lucide React for icons

2.  **System Architecture**:
    *   **Client-Side Only**: No backend required.
    *   **Persistence**: Uses `localStorage` to save content, title, and theme.
    *   **Reactive State**: Immediate updates as you type.

3.  **UI/UX Design**:
    *   **Split-Screen**: Editor on left, Preview on right (Desktop).
    *   **Tabbed Interface**: Toggle between Editor and Preview (Mobile).
    *   **Dark Mode**: Fully supported with a toggle in the header.
    *   **Toolbar**: Helper buttons for common Markdown syntax.
    *   **A4 Preview**: The preview pane simulates an A4 paper sheet.

4.  **PDF Export**:
    *   Clicking "Export PDF" opens the browser's print dialog.
    *   The print view is optimized to show only the document content, hiding the editor and UI.

## How to Run

1.  Open the terminal.
2.  Run `npm install` (if not already done).
3.  Run `npm run dev`.
4.  Open `http://localhost:5173` in your browser.

## Verification

*   **Build**: Verified with `npm run build`.
*   **Linting**: Fixed unused imports and type errors.
*   **Functionality**:
    *   Typing in the editor updates the preview.
    *   Toolbar buttons insert markdown syntax.
    *   Theme toggle switches between light and dark modes.
    *   Refresh preserves the content (Local Storage).
    *   Export button triggers print dialog with correct styling.
