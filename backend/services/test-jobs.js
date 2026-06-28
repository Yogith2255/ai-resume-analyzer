require("dotenv").config();

const {
  fetchAdzunaJobs
} = require("./services/adzunaService");

const {
  fetchJoobleJobs
} = require("./services/joobleService");

(async () => {
  console.log("===== ADZUNA =====");

  const adzunaJobs =
    await fetchAdzunaJobs("python");

  console.log(
    "Jobs Found:",
    adzunaJobs.length
  );

  if (adzunaJobs.length > 0) {
    console.log(
      adzunaJobs[0].title
    );
  }

  console.log("\n===== JOOBLE =====");

  const joobleJobs =
    await fetchJoobleJobs("python");

  console.log(
    "Jobs Found:",
    joobleJobs.length
  );

  if (joobleJobs.length > 0) {
    console.log(
      joobleJobs[0].title
    );
  }
})();