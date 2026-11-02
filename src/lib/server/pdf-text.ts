export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { default: pdf } = await import("pdf-parse");
  // PDF.js expects TypedArray.slice() to copy. Buffer.slice() returns a view,
  // causing valid PDFs to fail with "bad XRef entry". Its wrapper's typings
  // incorrectly restrict the supported input to Buffer.
  const parse = pdf as (data: Uint8Array) => ReturnType<typeof pdf>;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      parse(new Uint8Array(buffer)),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("PDF parsing timed out")), 10000);
      }),
    ]);
    return result.text;
  } finally {
    clearTimeout(timer);
  }
}
