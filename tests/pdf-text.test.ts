import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { extractPdfText } from "../src/lib/server/pdf-text";

test("extracts a valid PDF from a Node Buffer without corrupting cross references", async () => {
  const bytes = await readFile(new URL("./fixtures/text.pdf", import.meta.url));
  const original = Buffer.from(bytes);
  assert.match(await extractPdfText(bytes), /approved budget is 63000 rupees/);
  assert.deepEqual(bytes, original);
});

test("rejects invalid PDF data", async () => {
  await assert.rejects(extractPdfText(Buffer.from("not a PDF")));
});
