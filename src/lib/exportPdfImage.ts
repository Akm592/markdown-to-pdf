import { downloadBlob, toFilename } from './download';
import { PRINT_WIDTH_MM, PRINT_HEIGHT_MM } from './print';

// Rendered at 2x so text stays crisp when the canvas is scaled onto the page.
const CAPTURE_SCALE = 2;
const PAGE_MARGIN_MM = 20;
const MM_TO_PX = 96 / 25.4;

// Worst-case canvas ceilings across browsers. iOS Safari is the binding
// constraint (~16.7M pixels of area, 8192 per side); Chrome allows far more but
// still stops at 65535 per side.
//
// This matters more than it looks: a canvas past the ceiling is NOT an error.
// getContext('2d') still returns a context and every draw silently no-ops, so
// the export would hand back a blank PDF with nothing to report. Capturing in
// bands keeps every individual canvas inside the ceiling, which also caps peak
// memory -- a full-document capture of a long file is hundreds of MB.
const MAX_CANVAS_DIM = 8192;
const MAX_CANVAS_AREA = 16_777_216;

// Blocks that should not be sliced across a page boundary. Mirrors the
// `break-inside: avoid` set in index.css, which the print path gets for free
// from the browser but a canvas slicer has to honour by hand.
const ATOMIC_BLOCKS =
  'table, pre, blockquote, img, .not-prose, .admonition, .mermaid-figure';

// Never shrink a page below this fraction of its height chasing a clean break;
// a block taller than a page has to be sliced regardless.
const MIN_PAGE_FILL = 0.25;

interface Span {
  top: number;
  bottom: number;
}

/** Vertical extent of each atomic block, in CSS pixels relative to `root`. */
function measureAtomicBlocks(root: HTMLElement): Span[] {
  const rootTop = root.getBoundingClientRect().top;
  return Array.from(root.querySelectorAll<HTMLElement>(ATOMIC_BLOCKS))
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top - rootTop, bottom: rect.bottom - rootTop };
    })
    .filter((box) => box.bottom > box.top);
}

/**
 * Where to cut the next page: the natural boundary, pulled up to the top of
 * any atomic block it would otherwise slice through.
 */
function findPageBreak(offset: number, natural: number, limit: number, blocks: Span[]) {
  if (natural >= limit) return limit;

  const straddled = blocks
    .filter((b) => b.top > offset && b.top < natural && b.bottom > natural)
    .sort((a, b) => a.top - b.top)[0];

  if (!straddled) return natural;
  if (straddled.top - offset < (natural - offset) * MIN_PAGE_FILL) return natural;
  return straddled.top;
}

/**
 * Splits the document into page-sized spans, in CSS pixels.
 *
 * Page boundaries come from the laid-out DOM rather than from the captured
 * canvas, so they are known before anything is rasterised -- which is what lets
 * the capture be split into bands that never straddle a page.
 */
function planPages(contentHeight: number, pageHeight: number, blocks: Span[]): Span[] {
  const pages: Span[] = [];
  let offset = 0;

  while (offset < contentHeight) {
    const end = findPageBreak(offset, offset + pageHeight, contentHeight, blocks);
    // Guarantees forward progress even if a break lands on the offset.
    const height = Math.max(1, end - offset);
    pages.push({ top: offset, bottom: offset + height });
    offset += height;
  }

  return pages;
}

/**
 * Groups pages into capture bands that each fit inside the canvas ceiling.
 *
 * A single page always fits (about 1943x1286 device pixels at 2x), so every
 * band holds at least one and the grouping cannot stall.
 */
function planBands(pages: Span[], widthPx: number, scale: number): Span[] {
  const maxBandHeight = Math.min(
    MAX_CANVAS_DIM / scale,
    MAX_CANVAS_AREA / (widthPx * scale) / scale
  );

  const bands: Span[] = [];
  for (const page of pages) {
    const current = bands[bands.length - 1];
    if (current && page.bottom - current.top <= maxBandHeight) {
      current.bottom = page.bottom;
    } else {
      bands.push({ top: page.top, bottom: page.bottom });
    }
  }
  return bands;
}

// Mermaid diagrams only. Deliberately NOT every <svg>: KaTeX draws stretchy
// radicals as an oversized SVG that its parent clips with overflow:hidden, so
// resizing one to its bounding box erases the radical and square roots render
// as a blank gap. html2canvas handles those correctly on its own.
const MERMAID_SVG = 'svg[id^="mermaid"], svg[aria-roledescription]';

/**
 * Replaces each Mermaid <svg> with an equivalent <img> carrying a data URI.
 *
 * html2canvas rasterises the DOM itself and does not render Mermaid's inline
 * SVG reliably, so without this pass diagrams come out blank. Operates on a
 * detached clone, never the live tree.
 */
async function inlineSvgAsImages(root: HTMLElement) {
  const svgs = Array.from(root.querySelectorAll<SVGElement>(MERMAID_SVG));

  await Promise.all(
    svgs.map(async (svg) => {
      const rect = svg.getBoundingClientRect();
      const width = rect.width || Number(svg.getAttribute('width')) || 600;
      const height = rect.height || Number(svg.getAttribute('height')) || 400;

      // A serialised SVG must carry its own dimensions and namespace to be
      // loadable as an image.
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', String(width));
      clone.setAttribute('height', String(height));

      const source = new XMLSerializer().serializeToString(clone);
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;

      const img = new Image();
      img.width = width;
      img.height = height;
      img.style.width = `${width}px`;
      img.style.height = `${height}px`;

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        // A diagram that will not serialise should not abort the whole export.
        img.onerror = () => resolve();
        img.src = dataUri;
      });

      svg.replaceWith(img);
    })
  );
}

/**
 * Exports the document by rasterising the fixed-width print target, bypassing
 * the browser print stack entirely.
 *
 * The print target is already laid out at a fixed 170mm off-screen, so the
 * capture is identical on every device by construction -- which is the point:
 * it cannot be affected by how a given browser decides to lay out a print job.
 *
 * The trade is that text is not selectable and the file is larger, so this is
 * offered alongside the normal print export rather than replacing it.
 */
export async function exportPdfImage(source: HTMLElement, title: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  // Capture a detached clone so the SVG substitution never touches the live
  // tree that the print/PDF export also reads from.
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = `position:fixed; left:-10000px; top:0; width:${PRINT_WIDTH_MM}mm; background:#ffffff;`;
  const clone = source.cloneNode(true) as HTMLElement;
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    await inlineSvgAsImages(clone);

    const bounds = clone.getBoundingClientRect();
    const contentWidth = bounds.width;
    const contentHeight = bounds.height;
    if (contentWidth < 1 || contentHeight < 1) {
      throw new Error('Nothing to export');
    }

    // Everything below is planned in CSS pixels against the laid-out clone, so
    // pagination is settled before a single pixel is rasterised.
    const pageHeight = PRINT_HEIGHT_MM * MM_TO_PX;
    const blocks = measureAtomicBlocks(clone);
    const pages = planPages(contentHeight, pageHeight, blocks);
    const bands = planBands(pages, contentWidth, CAPTURE_SCALE);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const slice = document.createElement('canvas');
    const ctx = slice.getContext('2d');
    if (!ctx) throw new Error('Could not create a 2D canvas context');

    let pageIndex = 0;
    for (const band of bands) {
      const bandHeight = band.bottom - band.top;
      const canvas = await html2canvas(clone, {
        scale: CAPTURE_SCALE,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        // Capture only this band. Without the crop a long document would ask
        // for a canvas past the browser ceiling and come back silently blank.
        x: 0,
        y: band.top,
        width: contentWidth,
        height: bandHeight,
      });

      // The requested crop and the delivered canvas can differ by a rounding
      // step, so map source rows through the ratio actually returned.
      const pxPerCss = canvas.height / bandHeight;

      while (pageIndex < pages.length && pages[pageIndex].top < band.bottom) {
        const page = pages[pageIndex];
        const sy = Math.round((page.top - band.top) * pxPerCss);
        const sh = Math.max(1, Math.min(Math.round((page.bottom - page.top) * pxPerCss), canvas.height - sy));

        slice.width = canvas.width;
        slice.height = sh;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.92),
          'JPEG',
          PAGE_MARGIN_MM,
          PAGE_MARGIN_MM,
          PRINT_WIDTH_MM,
          sh / pxPerCss / MM_TO_PX,
          undefined,
          'FAST'
        );

        pageIndex++;
      }
    }

    downloadBlob(pdf.output('blob'), toFilename(title, 'pdf'));
  } finally {
    host.remove();
  }
}
