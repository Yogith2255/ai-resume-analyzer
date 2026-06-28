require("dotenv").config();

const {
  getRecommendations
} = require(
  "../services/recommendationService"
);

(async () => {
  const userSkills = [
    "Python",
    "SQL",
    "React",
    "Node.js",
    "GitHub",
    "Machine Learning"
  ];

  const jobs =
    await getRecommendations(
      userSkills
    );

  console.log(
    jobs.slice(0, 5)
  );
})();