import type { PluggableList } from 'unified';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkGemoji from 'remark-gemoji';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';

export const ADMONITION_TYPES = ['note', 'tip', 'info', 'warning', 'danger'] as const;

export type AdmonitionType = (typeof ADMONITION_TYPES)[number];

// Default heading shown when a directive carries no explicit {title="..."}.
// Shared by the on-screen Admonition component and the DOCX exporter so the
// two renderers cannot drift apart.
export const ADMONITION_LABELS: Record<AdmonitionType, string> = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
};

// Node shape that remark-directive adds to the tree. Not part of the base
// mdast types, so it is declared here rather than cast to `any` at each use.
export interface DirectiveNode {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  attributes?: Record<string, string | null | undefined> | null;
  children?: Root['children'];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

const DIRECTIVE_TYPES = new Set(['containerDirective', 'leafDirective', 'textDirective']);

export const isAdmonitionDirective = (node: { type: string }): node is DirectiveNode =>
  DIRECTIVE_TYPES.has(node.type) &&
  ADMONITION_TYPES.includes((node as DirectiveNode).name as AdmonitionType);

/**
 * Tags `:::note` / `:::tip` / ... directives so react-markdown renders them
 * through the custom <admonition> element. HTML-pipeline only: the DOCX
 * exporter reads the same directives but rewrites them into blockquotes.
 */
export function remarkAdmonitions() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!isAdmonitionDirective(node)) return;
      const data = node.data || (node.data = {});
      data.hName = 'admonition';
      data.hProperties = {
        type: node.name,
        title: node.attributes?.title || '',
      };
    });
  };
}

/**
 * The single source of truth for how markdown is parsed in this app.
 *
 * Both renderers consume this list: <MarkdownDocument> passes it to
 * react-markdown for the preview and the print target, and the DOCX exporter
 * feeds it to its own unified pipeline. react-markdown v10 cannot accept a
 * pre-parsed AST, so the two paths each parse -- but they must never disagree
 * about *how*, which is what this shared list guarantees.
 */
export const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkMath,
  remarkGemoji,
  remarkFrontmatter,
  remarkDirective,
  remarkAdmonitions,
];
