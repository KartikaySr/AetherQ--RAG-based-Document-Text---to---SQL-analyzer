const fs = require('fs');
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test.pdf'));
doc.text('This is a test PDF document for testing parsing capabilities.');
doc.end();
