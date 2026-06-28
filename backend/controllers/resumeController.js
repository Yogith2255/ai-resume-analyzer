const parseResume = require("../services/resumeParser");
const extractSkills = require("../utils/extractSkills");

const {
  saveSkills,
  deleteSkills
} = require("../services/skillService");

const path = require("path");
const db = require("../config/database");

function currentResume(userId) {
  return (
    db.prepare(`
      SELECT
        original_filename AS name,
        content_type AS contentType,
        size_bytes AS size
      FROM resumes
      WHERE user_id = ?
      AND is_current = 1
    `).get(userId) || null
  );
}

exports.updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a resume file."
      });
    }

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE resumes
        SET is_current = 0
        WHERE user_id = ?
        AND is_current = 1
      `).run(req.user.id);

      db.prepare(`
        INSERT INTO resumes (
          user_id,
          stored_filename,
          original_filename,
          content_type,
          size_bytes,
          is_current
        )
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(
        req.user.id,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size
      );
    });

    transaction();

const uploadsDir = process.env.UPLOAD_DIR || path.join(
  __dirname,
  "../uploads/resumes"
);
const resumePath = path.join(
  uploadsDir,
  req.file.filename
);

const resumeText =
  await parseResume(resumePath);

const extractedSkills =
  extractSkills(resumeText);
  console.log("=== RESUME UPLOAD HIT ===");
console.log("User ID:", req.user.id);
console.log("Skills:", extractedSkills);

deleteSkills(req.user.id);

saveSkills(
  req.user.id,
  extractedSkills
);

res.status(201).json({
  resume: currentResume(req.user.id),
  skills: extractedSkills
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update resume."
    });
  }
};