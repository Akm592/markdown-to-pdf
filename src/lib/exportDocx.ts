import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Blockquote, Parent, Root, RootContent } from 'mdast';
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
    },
    {
      // mermaid must run before image: it emits SVG that the image plugin embeds.
      plugins: [
        plugins.mermaidPlugin(),
        plugins.imagePlugin(),
        plugins.mathPlugin(),
        plugins.tablePlugin(),
        plugins.listPlugin(),
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
