import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
// Critical: Version must match the 'pdfjs-dist' version in index.html exactly (5.4.530).
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (
  file: File, 
  onProgress?: (percent: number, current: number, total: number) => void
): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdf.numPages;

    // Process all pages
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Optimizing string concatenation
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
            
        fullText += `\n--- Page ${i} ---\n${pageText}`;
        
        // Report progress
        if (onProgress) {
            onProgress(Math.round((i / numPages) * 100), i, numPages);
        }
      } catch (pageError) {
        console.warn(`Skipping page ${i} due to error:`, pageError);
        fullText += `\n--- Page ${i} (Error reading content) ---\n`;
      }
    }

    return fullText;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to parse PDF document. Ensure the file is not password protected.");
  }
};