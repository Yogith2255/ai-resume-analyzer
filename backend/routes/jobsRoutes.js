const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const jobsController =
  require(
    "../controllers/jobsController"
  );

router.get(
  "/recommendations",
  authMiddleware,
  jobsController.getRecommendations
);

module.exports = router;