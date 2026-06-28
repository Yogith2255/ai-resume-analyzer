// backend/tests/test-user5-skills.js

const db = require("../config/database");

console.log(
  db.prepare(`
    SELECT *
    FROM user_skills
    WHERE user_id = 2
  `).all()
);