const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadsDir = process.env.UPLOAD_DIR || path.join(
  __dirname,
  "../uploads/resumes"
);

fs.mkdirSync(uploadsDir, { recursive: true });

const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      cb(
        null,
        `${Date.now()}-${crypto.randomUUID()}${path.extname(
          file.originalname
        )}`
      );
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    cb(null, allowedTypes.has(file.mimetype));
  }
});

module.exports = upload;