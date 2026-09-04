import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Self-host Monaco. @monaco-editor/loader otherwise pulls it from jsDelivr
    // at runtime; Editor.tsx points it at /monaco/vs instead. These are plain
    // static assets -- they never enter the Rollup graph, so they cost nothing
    // in the entry chunk and are fetched only when the desktop editor mounts.
    viteStaticCopy({
      targets: [
        {
          // Everything except the language-service workers, handled below.
          src: [
            'node_modules/monaco-editor/min/vs/*',
            '!node_modules/monaco-editor/min/vs/assets',
          ],
          dest: 'monaco/vs',
        },
        {
          // Monaco core needs editor.worker. The ts (5.9MB), css, html and json
          // workers only load for those languages -- this is a markdown editor,
          // so shipping them would be ~7.9MB of files nothing ever requests.
          src: [
            'node_modules/monaco-editor/min/vs/assets/*',
            '!**/{ts,css,html,json}.worker*',
          ],
          dest: 'monaco/vs/assets',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      // jsPDF statically imports html2canvas for its `.html()` helper, which
      // this app never calls -- exportPdfImage drives html2canvas-pro directly.
      // Without this alias the PDF chunk ships BOTH libraries (~200KB of the
      // second one is dead weight). html2canvas-pro is an API-compatible fork,
      // so pointing the old specifier at it collapses them into one copy.
      html2canvas: 'html2canvas-pro',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks: the React runtime and the markdown/math stack
        // change far less often than app code, so splitting them lets browsers
        // keep them cached across deploys.
        manualChunks: {
          react: ['react', 'react-dom'],
          katex: ['katex', 'rehype-katex'],
          markdown: [
            'react-markdown',
            'remark-gfm',
            'remark-math',
            'remark-gemoji',
            'remark-frontmatter',
            'remark-directive',
            'unist-util-visit',
          ],
        },
      },
    },
  },
})
