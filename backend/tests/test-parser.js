const path = require("path");

const parseResume = require(
  "../services/resumeParser"
);

(async () => {
    const text = await parseResume(
        path.join(
          __dirname,
          "uploads/resumes/1782291058398-301cf515-cc44-4169-83c5-01242fed164a.pdf"
        )
      );

  console.log(text);
})();
// const pdfParse = require("pdf-parse");

// console.log(pdfParse);