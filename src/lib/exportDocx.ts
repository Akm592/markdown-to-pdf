import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Blockquote, Parent, Root, RootContent } from 'mdast';
import type { IDocxProps } from 'mdast2docx';
import type { ILevelsOptions } from 'docx';
import {
  ADMONITION_LABELS,
  isAdmonitionDirective,
  remarkPlugins,
  type AdmonitionType,
} from './markdownPlugins';
import { downloadBlob, toFilename } from './download';

// A4 at 2cm margins, matching the `@page` rule the PDF export uses.
// docx measures in twips: 1cm = 566.93 twips, 1mm = 56.693 twips.
const A4_TWIPS = { width: 11906, height: 16838 };
const MARGIN_2CM = 1134;
const TWIPS_PER_INCH = 1440;
const inches = (n: number) => Math.round(n * TWIPS_PER_INCH);

// Palette lifted from the on-screen renderer so Word output reads as the same
// document as the preview. See MarkdownDocument.tsx / CodeBlock.tsx.
const INK = '0F172A';        // slate-900, headings
const BODY = '334155';       // slate-700, paragraphs
const MUTED = '64748B';      // slate-500, h6
const LINK = '2563EB';       // blue-600
const CODE_INK = '1E293B';   // slate-800, code text
const CODE_FILL = 'F1F5F9';  // slate-100, code ground (inline and block)
const RULE = 'E2E8F0';       // slate-200, table borders
const HEAD_FILL = 'F1F5F9';  // slate-100, table header ground

/**
 * Replaces @m2d/core's built-in style defaults.
 *
 * Those defaults do not survive contact with Word:
 *   - every paragraph is set to `thaiDistribute` justification, which Word
 *     honours by stretching inter-character spacing across English text
 *     (LibreOffice ignores the value, so it only shows up in Word);
 *   - no heading carries bold, and Heading3 is the same size as body text;
 *   - core emits paragraphs referencing a `blockCode` paragraph style and runs
 *     referencing a `code` character style, but defines NEITHER. Word drops the
 *     dangling reference and falls back to Normal, so code blocks render as
 *     ordinary body text. They are defined here.
 *
 * The library deep-merges this over its defaults, so only the named keys move.
 */
const DOCUMENT_STYLES: IDocxProps['styles'] = {
  default: {
    document: {
      run: { font: 'Calibri', size: 22, color: BODY },
      paragraph: {
        alignment: 'left',
        spacing: { before: 0, after: 160, line: 276 },
      },
    },
    heading1: {
      run: { font: 'Calibri', size: 40, bold: true, color: INK },
      paragraph: { spacing: { before: 320, after: 160 } },
    },
    heading2: {
      run: { font: 'Calibri', size: 32, bold: true, color: INK },
      paragraph: { spacing: { before: 300, after: 140 } },
    },
    heading3: {
      run: { font: 'Calibri', size: 28, bold: true, color: INK },
      paragraph: { spacing: { before: 260, after: 120 } },
    },
    heading4: {
      run: { font: 'Calibri', size: 24, bold: true, color: INK },
      paragraph: { spacing: { before: 240, after: 100 } },
    },
    heading5: {
      run: { font: 'Calibri', size: 22, bold: true, color: INK },
      paragraph: { spacing: { before: 220, after: 100 } },
    },
    heading6: {
      run: { font: 'Calibri', size: 22, bold: true, color: MUTED },
      paragraph: { spacing: { before: 220, after: 100 } },
    },
    hyperlink: { run: { color: LINK, underline: {} } },
  },
  paragraphStyles: [
    {
      // Referenced by every fenced code block core emits. Core also sets a
      // hairline border inline (0.125pt, invisible), and an inline border wins
      // over a style one -- so the block is made legible with shading instead.
      id: 'blockCode',
      name: 'Block Code',
      basedOn: 'Normal',
      quickFormat: true,
      run: { font: 'Consolas', size: 19, color: CODE_INK },
      paragraph: {
        alignment: 'left',
        spacing: { before: 160, after: 160, line: 240 },
        indent: { left: inches(0.15), right: inches(0.15) },
        // Matches the `code` run shading below. Core tags the runs INSIDE a
        // code block with `code` as well, so if the two grounds differed the
        // run shading would paint darker bands over each line of the block.
        shading: { type: 'clear', fill: CODE_FILL, color: 'auto' },
      },
    },
  ],
  characterStyles: [
    {
      // Referenced by `inline code` runs -- and by every run inside a fenced
      // block, which core tags identically. The two cannot be told apart here,
      // so this stays neutral rather than taking the preview's pink, which
      // would tint whole code blocks.
      id: 'code',
      name: 'Code',
      basedOn: 'DefaultParagraphFont',
      run: {
        font: 'Consolas',
        size: 19,
        color: CODE_INK,
        shading: { type: 'clear', fill: CODE_FILL, color: 'auto' },
      },
    },
  ],
};

/**
 * Numbering levels for ordered and unordered lists.
 *
 * @m2d/list's defaults set `indent.left` but no `hanging`, so Word puts the
 * marker at the indent and the text at the next default tab stop -- which is
 * the wide marker-to-text gap in the current export. A hanging indent pulls
 * the marker back out and sets the text where the indent actually points.
 */
const LIST_INDENT = 0.3;
const LIST_STEP = 0.3;
const LIST_HANGING = 0.28;

const listLevels = (
  formats: ILevelsOptions['format'][],
  text: (level: number) => string
): ILevelsOptions[] =>
  formats.map((format, level) => ({
    level,
    format,
    text: text(level),
    alignment: 'start',
    style: {
      paragraph: {
        indent: {
          left: inches(LIST_INDENT + level * LIST_STEP),
          hanging: inches(LIST_HANGING),
        },
      },
    },
  }));

const ORDERED_LEVELS = listLevels(
  ['decimal', 'lowerLetter', 'lowerRoman', 'decimal', 'lowerLetter', 'lowerRoman'],
  (level) => `%${level + 1}.`
);

const BULLET_GLYPHS = ['\u2022', '\u25E6', '\u25AA', '\u2022', '\u25E6', '\u25AA'];
const BULLET_LEVELS = listLevels(
  BULLET_GLYPHS.map(() => 'bullet' as const),
  (level) => BULLET_GLYPHS[level]
);

/**
 * Rewrites `:::note` / `:::warning` directives into blockquotes led by a bold
 * label. @m2d/core has no concept of remark-directive nodes, so without this
 * every admonition -- and its contents -- would be silently dropped from the
 * DOCX. The on-screen renderer keeps using the richer <Admonition> component.
 */
function remarkAdmonitionsToBlockquote() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === null || index === undefined) return;
      if (!isAdmonitionDirective(node)) return;

      const label = node.attributes?.title || ADMONITION_LABELS[node.name as AdmonitionType];
      const blockquote: Blockquote = {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ type: 'strong', children: [{ type: 'text', value: label }] }] },
          ...((node.children ?? []) as Blockquote['children']),
        ],
      };

      (parent as Parent).children[index] = blockquote as RootContent;
    });
  };
}

/** Parses markdown into the MDAST that the DOCX writer consumes. */
async function buildAst(markdown: string): Promise<Root> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkAdmonitionsToBlockquote);

  return processor.run(processor.parse(markdown)) as Promise<Root>;
}

/**
 * Converts the current document to .docx and hands it to the browser.
 *
 * Everything heavy here -- the docx writer, the mermaid rasteriser, the LaTeX
 * converter -- is behind dynamic imports so none of it lands in the initial
 * bundle. Only pressed export pays for it.
 */
export async function exportDocx(markdown: string, title: string) {
  const [{ toDocx }, plugins, ast] = await Promise.all([
    import('mdast2docx'),
    import('mdast2docx/plugins'),
    buildAst(markdown),
  ]);

  const blob = (await toDocx(
    ast,
    {
      title,
      creator: 'Markdown2PDF',
      description: 'Exported from Markdown2PDF',
      styles: DOCUMENT_STYLES,
    },
    {
      // Core defaults to mapping H1 onto Word's Title style and shifting every
      // other level down one. The app carries its own title field, so that
      // would put two competing titles in the file and push `####` onto a
      // body-sized style. Keep markdown headings on the matching Word heading.
      useTitle: false,
      // mermaid must run before image: it emits SVG that the image plugin embeds.
      plugins: [
        plugins.mermaidPlugin(),
        // The plugin defaults to fitting images inside 6.3in x 9.7in. 9.7in is
        // 96% of the A4 text height, so a tall diagram cannot share a page with
        // the heading above it -- it gets pushed to a page of its own and
        // strands a near-blank one behind it. 7.5in still fills the column
        // width and leaves room for a heading and a line of text.
        plugins.imagePlugin({ maxH: 7.5 }),
        plugins.mathPlugin(),
        plugins.tablePlugin({
          tableProps: {
            borders: {
              top: { style: 'single', size: 4, color: RULE },
              bottom: { style: 'single', size: 4, color: RULE },
              left: { style: 'single', size: 4, color: RULE },
              right: { style: 'single', size: 4, color: RULE },
              insideHorizontal: { style: 'single', size: 4, color: RULE },
              insideVertical: { style: 'single', size: 4, color: RULE },
            },
          },
          // The plugin's default header shading is `{ type: 'solid', fill }`,
          // but with `solid` Word paints from `color` (absent -> auto), not
          // `fill`, so the header comes out unshaded. `clear` fills from `fill`.
          firstRowCellProps: {
            shading: { type: 'clear', fill: HEAD_FILL, color: 'auto' },
          },
        }),
        // Required for ordered lists: without it core logs "Please add
        // numbering plugin to support ordered lists" and renders `1. 2. 3.`
        // as bullets.
        plugins.listPlugin({ levels: ORDERED_LEVELS, bulletLevels: BULLET_LEVELS }),
        plugins.htmlPlugin(),
      ],
      properties: {
        page: {
          size: A4_TWIPS,
          margin: {
            top: MARGIN_2CM,
            right: MARGIN_2CM,
            bottom: MARGIN_2CM,
            left: MARGIN_2CM,
          },
        },
      },
    },
    'blob'
  )) as Blob;

  downloadBlob(blob, toFilename(title, 'docx'));
}
