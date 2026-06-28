const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

router.get(
  "/skills",
  authMiddleware,
  profileController.getSkills
);

router.post(
  "/skills",
  authMiddleware,
  profileController.addSkill
);

router.delete(
  "/skills/:skillName",
  authMiddleware,
  profileController.deleteSkill
);

module.exports = router;