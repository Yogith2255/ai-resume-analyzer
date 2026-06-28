const db = require("../config/database");

async function getUserSkills(userId) {
  const result = await db.query(`
    SELECT skill_name
    FROM user_skills
    WHERE user_id = $1
  `, [userId]);
  return result.rows.map(row => row.skill_name);
}

async function saveSkills(userId, skills) {
  for (const skill of skills) {
    await db.query(`
      INSERT INTO user_skills (user_id, skill_name)
      VALUES ($1, $2)
      ON CONFLICT (user_id, skill_name) DO NOTHING
    `, [userId, skill]);
  }
}

async function getSkills(userId) {
  const result = await db.query(`
    SELECT skill_name
    FROM user_skills
    WHERE user_id = $1
    ORDER BY skill_name
  `, [userId]);
  return result.rows;
}

async function deleteSkills(userId) {
  await db.query(`
    DELETE FROM user_skills
    WHERE user_id = $1
  `, [userId]);
}

module.exports = {
  saveSkills,
  getSkills,
  deleteSkills,
  getUserSkills
};