const {
  getAllJobs
} = require("./jobsService");

const {
  analyzeJobMatch
} = require("./atsService");

async function getRecommendations(
  userSkills
) {
  const searches = [];

  if (
    userSkills.includes(
      "Machine Learning"
    )
  ) {
    searches.push(
      "Machine Learning Engineer"
    );
  }

  if (
    userSkills.includes(
      "Python"
    )
  ) {
    searches.push(
      "Python Developer"
    );
  }

  if (
    userSkills.includes(
      "React"
    )
  ) {
    searches.push(
      "React Developer"
    );
  }

  if (
    userSkills.includes(
      "Node.js"
    )
  ) {
    searches.push(
      "Node.js Developer"
    );
  }

  if (
    userSkills.includes(
      "Data Science"
    )
  ) {
    searches.push(
      "Data Scientist"
    );
  }

  if (
    searches.length === 0
  ) {
    searches.push(
      "Software Engineer"
    );
  }

  let jobs = [];

for (const search of searches) {
  const results =
    await getAllJobs(search);

  jobs.push(...results);
}

// Remove duplicates
const uniqueJobs = [];
const seenUrls = new Set();

for (const job of jobs) {
  if (
    !job.applyUrl ||
    seenUrls.has(job.applyUrl)
  ) {
    continue;
  }

  seenUrls.add(job.applyUrl);
  uniqueJobs.push(job);
}

jobs = uniqueJobs;

  const recommendations =
    jobs.map(job => {
      const ats =
        analyzeJobMatch(
          userSkills,
          job.skills
        );

      return {
        ...job,
        atsScore: ats.score,
        matchedSkills:
          ats.matchedSkills,
        missingSkills:
          ats.missingSkills
      };
    });

  recommendations.sort(
    (a, b) =>
      b.atsScore -
      a.atsScore
  );

  return recommendations;
}

module.exports = {
  getRecommendations
};