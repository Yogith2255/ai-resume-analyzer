const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function parseResume(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  try {
    // PDF
    if (extension === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      return data.text;
    }

    // DOCX
    if (extension === ".docx") {
      const result = await mammoth.extractRawText({
        path: filePath
      });

      return result.value;
    }

    // TXT
    if (extension === ".txt") {
      return fs.readFileSync(
        filePath,
        "utf-8"
      );
    }

    throw new Error(
      "Unsupported resume format"
    );

  } catch (error) {
    console.error(
      "Resume parsing error:",
      error
    );

    throw error;
  }
}

module.exports = parseResume;