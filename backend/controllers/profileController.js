const { getSkills } = require("../services/skillService");
const db = require("../config/database");

exports.getSkills = async (req, res) => {
  try {
    const skills = await getSkills(req.user.id);
    res.json({
      skills: skills.map(item => item.skill_name)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get profile skills" });
  }
};

exports.addSkill = async (req, res) => {
  try {
    const { skillName } = req.body;
    if (!skillName || skillName.trim() === "") {
      return res.status(400).json({ error: "Skill name cannot be empty" });
    }

    await db.query(`
      INSERT INTO user_skills (user_id, skill_name)
      VALUES ($1, $2)
      ON CONFLICT (user_id, skill_name) DO NOTHING
    `, [req.user.id, skillName.trim()]);

    const skills = await getSkills(req.user.id);
    res.json({
      skills: skills.map(item => item.skill_name)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add skill" });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    if (!skillName) {
      return res.status(400).json({ error: "Skill name is required" });
    }

    await db.query(`
      DELETE FROM user_skills
      WHERE user_id = $1 AND skill_name = $2
    `, [req.user.id, skillName]);

    const skills = await getSkills(req.user.id);
    res.json({
      skills: skills.map(item => item.skill_name)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
};