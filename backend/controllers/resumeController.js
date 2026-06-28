const parseResume = require("../services/resumeParser");
const extractSkills = require("../utils/extractSkills");

const {
  saveSkills,
  deleteSkills
} = require("../services/skillService");

const path = require("path");
const db = require("../config/database");

async function currentResume(userId) {
  const result = await db.query(`
    SELECT
      original_filename AS name,
      content_type AS "contentType",
      size_bytes AS size
    FROM resumes
    WHERE user_id = $1
    AND is_current = 1
  `, [userId]);
  return result.rows[0] || null;
}

exports.updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a resume file."
      });
    }

    await db.query(`
      UPDATE resumes
      SET is_current = 0
      WHERE user_id = $1
      AND is_current = 1
    `, [req.user.id]);

    await db.query(`
      INSERT INTO resumes (
        user_id,
        stored_filename,
        original_filename,
        content_type,
        size_bytes,
        is_current
      )
      VALUES ($1, $2, $3, $4, $5, 1)
    `, [
      req.user.id,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size
    ]);

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

    await deleteSkills(req.user.id);

    await saveSkills(
      req.user.id,
      extractedSkills
    );

    res.status(201).json({
      resume: await currentResume(req.user.id),
      skills: extractedSkills
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update resume."
    });
  }
};