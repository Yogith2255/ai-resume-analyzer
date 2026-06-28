const db = require("../config/database");


function getUserSkills(userId) {
    return db
      .prepare(`
        SELECT skill_name
        FROM user_skills
        WHERE user_id = ?
      `)
      .all(userId)
      .map(skill => skill.skill_name);
  }
function saveSkills(userId, skills) {
  const insertSkill = db.prepare(`
    INSERT OR IGNORE INTO user_skills
    (user_id, skill_name)
    VALUES (?, ?)
  `);

  const transaction = db.transaction(() => {
    skills.forEach(skill => {
      insertSkill.run(userId, skill);
    });
  });

  transaction();
}

function getSkills(userId) {
  return db.prepare(`
    SELECT skill_name
    FROM user_skills
    WHERE user_id = ?
    ORDER BY skill_name
  `).all(userId);
}

function deleteSkills(userId) {
  db.prepare(`
    DELETE FROM user_skills
    WHERE user_id = ?
  `).run(userId);
}

module.exports = {
  saveSkills,
  getSkills,
  deleteSkills,
  getUserSkills
};