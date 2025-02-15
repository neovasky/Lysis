declare module "pdfjs-dist/web/pdf_viewer" {
  import { PdfTextContent } from "pdfjs-dist/types/src/display/api";

  export class TextLayerBuilder {
    constructor(options: {
      textLayerDiv: HTMLDivElement;
      pageIndex: number;
      viewport: unknown;
      enhanceTextSelection?: boolean;
    });
    // Instead of a method, text content is now assigned directly:
    textContent: PdfTextContent;
    render(): void;
  }
}
