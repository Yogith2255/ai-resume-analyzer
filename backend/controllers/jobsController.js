const {
  getRecommendations: getJobRecommendations
} = require(
  "../services/recommendationService"
);

const {
  getUserSkills
} = require(
  "../services/skillService"
);

exports.getRecommendations =
  async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("User ID:", userId);

      const userSkills =
        getUserSkills(userId);

      console.log(
        "User Skills:",
        userSkills
      );

      const jobs =
        await getJobRecommendations(
          userSkills
        );
        console.log(
  "Jobs Found:",
  jobs.length
);

console.log(
  "Top Job:",
  jobs[0]
);

      const sections = {};

      jobs.forEach(job => {
        if (
          !sections[
            job.category
          ]
        ) {
          sections[
            job.category
          ] = [];
        }

        sections[
          job.category
        ].push(job);
      });

      const response = [];

      // Top 5 best jobs
      const topMatches =
        jobs.slice(0, 5);

      response.push({
        title: "🔥 Top Matches",
        jobs: topMatches
      });

      // Prevent duplicates
      const topMatchUrls =
        new Set(
          topMatches.map(
            job => job.applyUrl
          )
        );

      // Category sections
      Object.entries(
        sections
      ).forEach(
        ([category, jobs]) => {

          const filteredJobs =
            jobs.filter(
              job =>
                !topMatchUrls.has(
                  job.applyUrl
                )
            );

          // Skip empty categories
          if (
            filteredJobs.length === 0
          ) {
            return;
          }

          let title = category;

          if (
            category ===
            "AI / ML"
          ) {
            title =
              "🤖 AI / ML";
          } else if (
            category ===
            "Backend"
          ) {
            title =
              "💻 Backend";
          } else if (
            category ===
            "Frontend"
          ) {
            title =
              "🌐 Frontend";
          } else if (
            category ===
            "Data Science"
          ) {
            title =
              "📊 Data Science";
          } else if (
            category ===
            "DevOps"
          ) {
            title =
              "☁ DevOps";
          } else if (
            category ===
            "Mobile Development"
          ) {
            title =
              "📱 Mobile Development";
          } else if (
            category ===
            "Cyber Security"
          ) {
            title =
              "🔒 Cyber Security";
          }

          response.push({
            title,
            jobs:
              filteredJobs.slice(
                0,
                8
              )
          });
        }
      );

      res.json({
        sections: response
      });

    } catch (error) {
      console.error(
        "Recommendations Error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to fetch recommendations"
      });
    }
  };