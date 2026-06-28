const { getSkills } = require("../services/skillService");
const db = require("../config/database");

exports.getSkills = (req, res) => {
  try {
    const skills = getSkills(req.user.id);
    res.json({
      skills: skills.map(item => item.skill_name)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get profile skills" });
  }
};

exports.addSkill = (req, res) => {
  try {
    const { skillName } = req.body;
    if (!skillName || skillName.trim() === "") {
      return res.status(400).json({ error: "Skill name cannot be empty" });
    }

    db.prepare(`
      INSERT OR IGNORE INTO user_skills (user_id, skill_name)
      VALUES (?, ?)
    `).run(req.user.id, skillName.trim());

    const skills = getSkills(req.user.id);
    res.json({
      skills: skills.map(item => item.skill_name)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add skill" });
  }
};

exports.deleteSkill = (req, res) => {
  try {
    const { skillName } = req.params;
    if (!skillName) {
      return res.status(400).json({ error: "Skill name is required" });
    }

    db.prepare(`
      DELETE FROM user_skills
      WHERE user_id = ? AND skill_name = ?
    `).run(req.user.id, skillName);

    const skills = getSkills(req.user.id);
    res.json({
      skills: skills.map(item => item.skill_name)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
};