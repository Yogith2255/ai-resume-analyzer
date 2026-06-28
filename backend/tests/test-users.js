// backend/tests/test-users.js

const db = require("../config/database");

const users = db
  .prepare(`
    SELECT id, full_name, email
    FROM users
  `)
  .all();

console.log(users);