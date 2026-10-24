/**
 * Search landing pages.
 *
 * Every page here ships the same editor app, plus its own <title>, meta tags,
 * structured data and a written guide in plain HTML below the editor. The guide
 * lives outside #root, so React never replaces it and crawlers that don't run
 * JavaScript still read it. seo/plugin.ts turns this list into HTML files, the
 * sitemap, robots.txt and llms.txt at build time.
 *
 * Keep the copy true to what the app does: Google compares it with the page.
 */

export interface Faq {
  q: string;
  /** Plain text. Reused verbatim in the FAQPage structured data. */
  a: string;
}

export interface Section {
  heading: string;
  /** Trusted, hand-written HTML. */
  html: string;
}

export interface SeoPage {
  /** URL path without trailing slash; '/' for the home page. */
  path: string;
  /** Output file in dist/ (Vercel's cleanUrls serves it without .html). */
  file: string;
  /** Under ~60 characters so Google doesn't truncate it. */
  title: string;
  /** Under ~160 characters. */
  description: string;
  h1: string;
  /** Short name for internal links and breadcrumbs. */
  navLabel: string;
  intro: string;
  sections: Section[];
  faqs: Faq[];
}

export const SITE_NAME = 'Markdown2PDF';
export const AUTHOR_NAME = 'Ashish Kumar Mishra';
export const GITHUB_REPO = 'https://github.com/Akm592/markdown-to-pdf';
export const GITHUB_PROFILE = 'https://github.com/Akm592';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const c = (s: string) => `<code>${esc(s)}</code>`;
const pre = (s: string) => `<pre><code>${esc(s.trim())}</code></pre>`;
const steps = (items: string[]) => `<ol>${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
const bullets = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

const EXPORT_STEPS = [
  'Write or paste your Markdown into the editor on the left. The preview on the right updates as you type.',
  'Check the layout on the A4 page preview: headings, tables, code blocks, diagrams and equations appear exactly as they will in the file.',
  'Open the <strong>Export</strong> menu in the top bar and choose a format.',
  'For <strong>PDF</strong>, pick “Save as PDF” in the print dialog. The editor interface is hidden automatically, so only your document is saved.',
];

export const PAGES: SeoPage[] = [
  {
    path: '/',
    file: 'index.html',
    title: 'Markdown to PDF Converter – Free, Private, No Signup',
    description:
      'Convert Markdown to PDF or Word for free in your browser. Live A4 preview, Mermaid diagrams, LaTeX math and code highlighting. No signup, no uploads.',
    h1: 'Free Markdown to PDF Converter',
    navLabel: 'Markdown to PDF',
    intro:
      'Markdown2PDF turns Markdown into a clean, print-ready PDF or Word document without leaving your browser. Paste your text, check it on a live A4 preview, and export. There is no account to create and nothing is uploaded: the conversion runs entirely on your device.',
    sections: [
      {
        heading: 'How to convert Markdown to PDF',
        html: steps(EXPORT_STEPS),
      },
      {
        heading: 'Four export formats',
        html: bullets([
          '<strong>PDF</strong> – uses your browser’s print engine, so text stays sharp and selectable and links keep working.',
          '<strong>PDF (exact layout)</strong> – renders each A4 page as an image, so the file looks identical on every device. Useful when a phone’s print dialog lays the page out badly. Text is not selectable and the file is larger.',
          '<strong>Word (.docx)</strong> – an editable document with real headings, lists, tables, images, diagrams and equations. See <a href="/markdown-to-word">Markdown to Word</a>.',
          '<strong>Markdown (.md)</strong> – download your source file to keep or share.',
        ]),
      },
      {
        heading: 'Everything Markdown can do, rendered properly',
        html: bullets([
          '<strong>GitHub Flavored Markdown</strong>: tables, task lists, strikethrough, autolinks and footnotes.',
          '<strong>Code blocks with syntax highlighting</strong> for JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, SQL, Bash, HTML/XML, CSS, JSON and YAML.',
          '<strong>Mermaid diagrams</strong>: flowcharts, sequence, class, state, Gantt and more, drawn straight from code. See <a href="/mermaid-to-pdf">Mermaid to PDF</a>.',
          '<strong>LaTeX math</strong> with KaTeX, inline and as display equations. See <a href="/markdown-math-to-pdf">Markdown math to PDF</a>.',
          `<strong>Callout boxes</strong> for notes, tips, info, warnings and danger, written as ${c(':::note')} blocks.`,
          `<strong>Emoji shortcodes</strong> like ${c(':rocket:')} and ${c(':white_check_mark:')}.`,
        ]),
      },
      {
        heading: 'Private by design',
        html: '<p>Most online converters upload your file to a server. Markdown2PDF does not. Rendering, PDF creation and Word export all run in your browser with JavaScript, and your document is saved only in your browser’s local storage. That makes it safe for internal notes, contracts, reports and anything else you would rather not hand to a third party. The project is <a href="' +
          GITHUB_REPO +
          '" rel="noopener">open source on GitHub</a>, so you can check this yourself.</p>',
      },
      {
        heading: 'Built for writing, not just converting',
        html: bullets([
          'A code editor with Markdown highlighting on desktop (the same editor as VS Code) and a lightweight editor on phones.',
          'A toolbar for bold, italic, headings, lists, task lists, links, images, tables and Mermaid diagrams.',
          'Automatic saving, so a refresh or closed tab never loses your work.',
          'Light and dark themes. Exports always use a clean light theme.',
        ]),
      },
    ],
    faqs: [
      {
        q: 'Is Markdown2PDF free?',
        a: 'Yes. Every feature, including PDF, Word and Markdown export, is free with no signup, watermark or page limit.',
      },
      {
        q: 'Is my document uploaded to a server?',
        a: 'No. Markdown2PDF converts everything in your browser. Your text, diagrams and equations never leave your device, and your work is stored only in your browser’s local storage.',
      },
      {
        q: 'Can I save my work and come back later?',
        a: 'Yes. The editor saves your document, its title and your theme automatically in your browser. Refresh the page or return later and everything is still there.',
      },
      {
        q: 'What page size does the PDF use?',
        a: 'PDFs use A4 paper with 2 cm margins. The preview shows the same A4 page, so what you see is what you get.',
      },
      {
        q: 'Does it work on a phone?',
        a: 'Yes. On small screens the app switches to a touch-friendly editor. If your phone’s print dialog produces a badly laid-out PDF, use “PDF (exact layout)”, which looks the same on every device.',
      },
      {
        q: 'Why does my PDF export open a print dialog?',
        a: 'The standard PDF export uses your browser’s print engine because it produces sharp, selectable text. Choose “Save as PDF” as the printer. If you would rather skip the dialog, use “PDF (exact layout)”, which downloads the file directly.',
      },
    ],
  },
  {
    path: '/markdown-to-word',
    file: 'markdown-to-word.html',
    title: 'Markdown to Word Converter (DOCX) – Free & Private',
    description:
      'Convert Markdown to an editable Word .docx file in your browser. Keeps headings, tables, code, images, Mermaid diagrams and math. Free, no upload.',
    h1: 'Markdown to Word (DOCX) Converter',
    navLabel: 'Markdown to Word',
    intro:
      'Need to hand a Markdown document to someone who works in Microsoft Word, Google Docs or LibreOffice? Paste it into the editor above and export a real, editable .docx file. The conversion runs in your browser, so your document is never uploaded.',
    sections: [
      {
        heading: 'How to convert Markdown to Word',
        html: steps([
          'Paste or write your Markdown in the editor above.',
          'Check the result in the live preview.',
          'Open <strong>Export</strong> and choose <strong>Word (.docx)</strong>. The file downloads straight away, named after your document title.',
          'Open it in Microsoft Word, Google Docs, Pages or LibreOffice and keep editing.',
        ]),
      },
      {
        heading: 'What carries over into Word',
        html: bullets([
          '<strong>Headings</strong> become real Word heading styles, so the navigation pane and automatic table of contents work.',
          '<strong>Bold, italic, strikethrough, inline code and links</strong> keep their formatting.',
          '<strong>Bulleted, numbered and task lists</strong>, including nested lists.',
          '<strong>Tables</strong> become native Word tables you can resize and restyle.',
          '<strong>Code blocks</strong> in a monospace font with a shaded background.',
          '<strong>Images</strong>, scaled to fit the page width.',
          '<strong>Mermaid diagrams</strong>, embedded as images sized to the page.',
          '<strong>LaTeX equations</strong>, converted for Word.',
          `<strong>Callouts</strong> such as ${c(':::warning')}, kept as labelled quote blocks.`,
        ]),
      },
      {
        heading: 'Why not just copy and paste?',
        html: '<p>Pasting rendered Markdown into Word usually brings along stray web styles, loses table structure and drops diagrams and equations entirely. Exporting a .docx builds the document with Word’s own styles instead, so it stays easy to edit, restyle and share.</p>',
      },
      {
        heading: 'Word or PDF?',
        html: `<p>Choose Word when someone needs to edit, comment on or track changes in the document. Choose PDF when the layout must stay fixed, for example a report, résumé or handout. Both come from the same Markdown, so you can export one of each. See the <a href="/">Markdown to PDF converter</a>.</p>`,
      },
    ],
    faqs: [
      {
        q: 'Is the Markdown to Word converter free?',
        a: 'Yes. Word export is free, with no signup, watermark or file limit.',
      },
      {
        q: 'Does the .docx file work in Google Docs and LibreOffice?',
        a: 'Yes. The file uses the standard Office Open XML format, so Google Docs, LibreOffice, Apple Pages and Microsoft Word all open it.',
      },
      {
        q: 'Are Mermaid diagrams included in the Word file?',
        a: 'Yes. Each Mermaid diagram is rendered and embedded as an image, scaled to fit within the page.',
      },
      {
        q: 'Is my document uploaded anywhere?',
        a: 'No. The .docx file is built in your browser and downloaded directly to your device.',
      },
    ],
  },
  {
    path: '/readme-to-pdf',
    file: 'readme-to-pdf.html',
    title: 'README to PDF – Convert GitHub Markdown to PDF Free',
    description:
      'Turn a GitHub README.md into a clean PDF. Supports GitHub Flavored Markdown: tables, task lists, code highlighting and Mermaid. Free, runs in your browser.',
    h1: 'Convert a GitHub README to PDF',
    navLabel: 'README to PDF',
    intro:
      'Project documentation, a portfolio piece, or a README a client asked for “as a PDF”: paste the Markdown above and export a tidy A4 document. GitHub Flavored Markdown is supported, so your file looks the way it does on GitHub.',
    sections: [
      {
        heading: 'How to turn a README into a PDF',
        html: steps([
          `Open the README on GitHub, click <strong>Raw</strong> (or the copy button), and copy the Markdown. For a local file, open ${c('README.md')} in any text editor.`,
          'Paste it into the editor above.',
          'Make sure images use full URLs (see the tip below).',
          'Choose <strong>Export → PDF</strong> and save.',
        ]),
      },
      {
        heading: 'GitHub Flavored Markdown support',
        html: bullets([
          'Tables with column alignment',
          `Task lists (${c('- [x] done')})`,
          `Strikethrough (${c('~~text~~')}), autolinks and footnotes`,
          'Fenced code blocks with syntax highlighting for 18 languages',
          `${c('```mermaid')} diagrams, which GitHub also renders`,
          `Math with ${c('$...$')} and ${c('$$...$$')}, as on GitHub`,
          `Emoji shortcodes such as ${c(':tada:')}`,
        ]),
      },
      {
        heading: 'Tip: fix relative image paths',
        html: `<p>READMEs often reference images with relative paths like ${c('./docs/screenshot.png')}. Those only resolve inside the repository, so the converter can’t load them. Replace them with absolute URLs, for example:</p>${pre(
          '![Screenshot](https://raw.githubusercontent.com/OWNER/REPO/main/docs/screenshot.png)',
        )}`,
      },
      {
        heading: 'Callouts',
        html: `<p>GitHub’s ${c('> [!NOTE]')} alert syntax shows up as a plain quote here. For a coloured callout box in the PDF, use a directive block instead:</p>${pre(
          ':::tip\nRun `npm install` before building.\n:::',
        )}<p>The types are ${c('note')}, ${c('tip')}, ${c('info')}, ${c('warning')} and ${c('danger')}.</p>`,
      },
    ],
    faqs: [
      {
        q: 'Can I convert a README straight from a GitHub URL?',
        a: 'Not yet. Copy the raw Markdown from GitHub and paste it into the editor. This keeps the tool fully offline: it never fetches or uploads anything on your behalf.',
      },
      {
        q: 'Why are some images missing from my PDF?',
        a: 'Images with relative paths, such as ./images/logo.png, only work inside the repository. Change them to absolute URLs, for example raw.githubusercontent.com links, and they will appear.',
      },
      {
        q: 'Will code blocks be highlighted in the PDF?',
        a: 'Yes. Fenced code blocks tagged with a language such as js, python or bash are highlighted with a print-friendly light theme, and long lines wrap instead of being cut off.',
      },
    ],
  },
  {
    path: '/mermaid-to-pdf',
    file: 'mermaid-to-pdf.html',
    title: 'Mermaid to PDF – Export Mermaid Diagrams Online Free',
    description:
      'Write Mermaid flowcharts, sequence diagrams and Gantt charts in Markdown and export them to PDF or Word. Live preview, free, private, in your browser.',
    h1: 'Export Mermaid Diagrams to PDF',
    navLabel: 'Mermaid to PDF',
    intro:
      'Mermaid lets you draw diagrams with plain text. Markdown2PDF renders them live next to your writing and exports them to PDF or Word, so diagrams and documentation end up in one file.',
    sections: [
      {
        heading: 'How to export a Mermaid diagram',
        html: steps([
          `Add a fenced code block tagged ${c('mermaid')} to your Markdown, or click the diagram button in the toolbar to insert a starter flowchart.`,
          'Edit the diagram code. The preview redraws as you type, and syntax errors are shown inline.',
          'Choose <strong>Export → PDF</strong> or <strong>Export → Word (.docx)</strong>.',
        ]),
      },
      {
        heading: 'Example',
        html: pre(`
\`\`\`mermaid
graph TD
    A[Write Markdown] --> B{Looks right?}
    B -->|Yes| C[Export PDF]
    B -->|No| A
\`\`\``),
      },
      {
        heading: 'Supported diagram types',
        html: '<p>Diagrams are rendered with the official Mermaid library, so every type it supports works here, including flowcharts, sequence diagrams, class diagrams, state diagrams, entity-relationship diagrams, Gantt charts, pie charts, user journeys, Git graphs, mind maps and timelines.</p>',
      },
      {
        heading: 'Diagrams that fit the page',
        html: '<p>Wide diagrams are scaled down to the page width instead of being cut off, and the exporter avoids splitting a diagram across two pages. In Word files, each diagram is embedded as an image sized to fit the printable area.</p>',
      },
    ],
    faqs: [
      {
        q: 'Can I export only a Mermaid diagram, without other text?',
        a: 'Yes. Put just the mermaid code block in the editor and export. The PDF will contain only the diagram.',
      },
      {
        q: 'Are diagrams sharp in the PDF?',
        a: 'With the standard PDF export, diagrams are kept as vector graphics, so they stay sharp at any zoom level.',
      },
      {
        q: 'Is my diagram code sent to a server?',
        a: 'No. Mermaid runs in your browser, so diagrams are drawn locally and never uploaded.',
      },
    ],
  },
  {
    path: '/markdown-math-to-pdf',
    file: 'markdown-math-to-pdf.html',
    title: 'Markdown with LaTeX Math to PDF – KaTeX Converter',
    description:
      'Write equations in Markdown with LaTeX syntax and export to PDF or Word. Inline and display math rendered with KaTeX. Free, live preview, no signup.',
    h1: 'Markdown with LaTeX Math to PDF',
    navLabel: 'Markdown math to PDF',
    intro:
      'Write your notes, homework or papers in Markdown and type equations in familiar LaTeX syntax. Markdown2PDF renders them with KaTeX as you type and exports them to PDF or Word with the rest of your document.',
    sections: [
      {
        heading: 'How to write math in Markdown',
        html: `<p>Wrap inline math in single dollar signs and display equations in double dollar signs:</p>${pre(
          'The energy is $E = mc^2$.\n\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}\n$$',
        )}`,
      },
      {
        heading: 'Common LaTeX you can use',
        html: `<table><thead><tr><th>Write</th><th>For</th></tr></thead><tbody>
<tr><td>${c('\\frac{a}{b}')}</td><td>Fractions</td></tr>
<tr><td>${c('x^2, x_i')}</td><td>Superscripts and subscripts</td></tr>
<tr><td>${c('\\sqrt{x}')}</td><td>Square roots</td></tr>
<tr><td>${c('\\sum_{i=1}^{n}')}</td><td>Sums</td></tr>
<tr><td>${c('\\int_a^b')}</td><td>Integrals</td></tr>
<tr><td>${c('\\alpha, \\beta, \\pi')}</td><td>Greek letters</td></tr>
<tr><td>${c('\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}')}</td><td>Matrices</td></tr>
</tbody></table>`,
      },
      {
        heading: 'Export to PDF or Word',
        html: steps([
          'Type your document and equations in the editor above.',
          'Check the rendered equations in the preview. Errors are highlighted instead of breaking the page.',
          'Export to <strong>PDF</strong> for a fixed layout, or <strong>Word (.docx)</strong> to keep editing.',
        ]),
      },
    ],
    faqs: [
      {
        q: 'Which math syntax is supported?',
        a: 'Standard LaTeX math as supported by KaTeX: fractions, roots, sums, integrals, matrices, Greek letters, accents and most common symbols. Use $...$ for inline math and $$...$$ for display equations.',
      },
      {
        q: 'Do equations work in the Word export?',
        a: 'Yes. Equations are converted for Word when you export to .docx.',
      },
      {
        q: 'Do I need to install LaTeX?',
        a: 'No. Everything runs in your browser. There is nothing to install and no account to create.',
      },
    ],
  },
  {
    path: '/markdown-cheat-sheet',
    file: 'markdown-cheat-sheet.html',
    title: 'Markdown Cheat Sheet – Syntax Guide with Examples',
    description:
      'A quick Markdown syntax reference: headings, emphasis, lists, links, images, tables, code, task lists, math and Mermaid diagrams. Try each one live.',
    h1: 'Markdown Cheat Sheet',
    navLabel: 'Markdown cheat sheet',
    intro:
      'A quick reference for Markdown syntax, including the GitHub Flavored Markdown extras. Every example works in the editor above, so you can paste it in and see the result instantly.',
    sections: [
      {
        heading: 'Basic syntax',
        html: `<table><thead><tr><th>Element</th><th>Markdown</th></tr></thead><tbody>
<tr><td>Heading</td><td>${c('# H1')} ${c('## H2')} ${c('### H3')}</td></tr>
<tr><td>Bold</td><td>${c('**bold text**')}</td></tr>
<tr><td>Italic</td><td>${c('_italic text_')}</td></tr>
<tr><td>Blockquote</td><td>${c('> quote')}</td></tr>
<tr><td>Ordered list</td><td>${c('1. First item')}</td></tr>
<tr><td>Unordered list</td><td>${c('- Item')}</td></tr>
<tr><td>Inline code</td><td>${c('`code`')}</td></tr>
<tr><td>Horizontal rule</td><td>${c('---')}</td></tr>
<tr><td>Link</td><td>${c('[title](https://example.com)')}</td></tr>
<tr><td>Image</td><td>${c('![alt text](image.png)')}</td></tr>
</tbody></table>`,
      },
      {
        heading: 'Extended syntax (GitHub Flavored Markdown)',
        html: `<table><thead><tr><th>Element</th><th>Markdown</th></tr></thead><tbody>
<tr><td>Strikethrough</td><td>${c('~~deleted~~')}</td></tr>
<tr><td>Task list</td><td>${c('- [x] Done')} ${c('- [ ] To do')}</td></tr>
<tr><td>Footnote</td><td>${c('Text[^1]')} … ${c('[^1]: Note.')}</td></tr>
<tr><td>Autolink</td><td>${c('https://example.com')}</td></tr>
<tr><td>Emoji</td><td>${c(':smile:')}</td></tr>
</tbody></table>`,
      },
      {
        heading: 'Tables',
        html: `${pre(
          '| Name  | Role     | Joined |\n| :---- | :------: | -----: |\n| Asha  | Engineer |   2024 |\n| Ravi  | Designer |   2025 |',
        )}<p>Colons in the separator row set alignment: left (${c(':---')}), centre (${c(':---:')}) or right (${c('---:')}).</p>`,
      },
      {
        heading: 'Code blocks',
        html: `<p>Fence code with three backticks and name the language for syntax highlighting:</p>${pre(
          '```python\ndef greet(name):\n    return f"Hello, {name}!"\n```',
        )}`,
      },
      {
        heading: 'Callouts',
        html: `${pre(':::warning{title="Heads up"}\nThis action cannot be undone.\n:::')}<p>Available types: ${c('note')}, ${c('tip')}, ${c('info')}, ${c('warning')}, ${c('danger')}. The title is optional.</p>`,
      },
      {
        heading: 'Math and diagrams',
        html: `<p>Inline math: ${c('$a^2 + b^2 = c^2$')}. Display math goes between ${c('$$')} lines. For diagrams, use a ${c('```mermaid')} code block. More examples: <a href="/markdown-math-to-pdf">math in Markdown</a> and <a href="/mermaid-to-pdf">Mermaid diagrams</a>.</p>`,
      },
    ],
    faqs: [
      {
        q: 'What is Markdown?',
        a: 'Markdown is a lightweight way to format plain text using symbols like # for headings and ** for bold. It is used for README files, documentation, notes and blogs because it is easy to read even before it is rendered.',
      },
      {
        q: 'What is GitHub Flavored Markdown?',
        a: 'GitHub Flavored Markdown (GFM) is the Markdown dialect GitHub uses. It adds tables, task lists, strikethrough, autolinks and footnotes to standard Markdown. Markdown2PDF supports all of them.',
      },
      {
        q: 'How do I add a line break in Markdown?',
        a: 'Leave a blank line between lines to start a new paragraph. For a line break inside a paragraph, end the line with two spaces or a backslash.',
      },
    ],
  },
];
