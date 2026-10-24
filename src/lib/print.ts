// A4 printable box: 210mm x 297mm page minus 2cm margins on every side.
export const PRINT_WIDTH_MM = 170;
export const PRINT_HEIGHT_MM = 257;

const MM_TO_PX = 96 / 25.4;
const toPx = (mm: number) => Math.round(mm * MM_TO_PX);

/**
 * Injected into the print iframe's own <head> by react-to-print.
 *
 * This is the fix for mobile export. react-to-print sizes its print iframe to
 * `document.documentElement.clientWidth` -- about 400px on a phone. Desktop
 * Chrome re-lays the print job out at paper width so that never showed, but
 * Android Chrome maps the iframe's layout onto the page roughly 1:1, which
 * squeezed the whole document into a narrow column and clipped anything wider.
 * Pinning html/body to the printable width makes layout independent of
 * whatever size the iframe element happens to be.
 *
 * `!important` is load-bearing: react-to-print injects this BEFORE copying the
 * app's stylesheets, so any property the app also sets (notably body's
 * background from Tailwind's base layer) would otherwise win on source order.
 */
export const PRINT_PAGE_STYLE = `
  @page {
    size: A4;
    margin: 2cm;
  }
  html, body {
    width: ${PRINT_WIDTH_MM}mm !important;
    min-width: ${PRINT_WIDTH_MM}mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    /* Android Chrome inflates fonts when text exceeds the layout viewport. */
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }
`;

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/**
 * Custom print routine handed the iframe by react-to-print.
 *
 * Belt-and-braces companion to PRINT_PAGE_STYLE: some browsers use the iframe
 * element's own box as the layout viewport rather than the document's width,
 * so the element is resized to the printable box too.
 *
 * Supplying a `print` option bypasses react-to-print's built-in documentTitle
 * handling, and Chrome derives the "Save as PDF" filename from the document
 * title -- so the title is set here and restored afterwards, or exports would
 * silently start saving as "about:blank.pdf".
 */
export async function printAtFixedWidth(iframe: HTMLIFrameElement, documentTitle: string) {
  iframe.width = String(toPx(PRINT_WIDTH_MM));
  iframe.height = String(toPx(PRINT_HEIGHT_MM));
  iframe.style.width = `${PRINT_WIDTH_MM}mm`;
  iframe.style.height = `${PRINT_HEIGHT_MM}mm`;

  // Let the resize take effect before the print snapshot is taken.
  await nextFrame();

  const ownerDoc = iframe.ownerDocument;
  const contentDoc = iframe.contentDocument;
  const previousOwnerTitle = ownerDoc.title;
  const previousContentTitle = contentDoc?.title ?? '';

  if (documentTitle) {
    ownerDoc.title = documentTitle;
    if (contentDoc) contentDoc.title = documentTitle;
  }

  try {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  } finally {
    if (documentTitle) {
      ownerDoc.title = previousOwnerTitle;
      if (contentDoc) contentDoc.title = previousContentTitle;
    }
  }
}
