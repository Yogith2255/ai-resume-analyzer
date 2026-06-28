require("dotenv").config();

const {
  getAllJobs
} = require("./services/jobsService");

(async () => {
  const jobs =
    await getAllJobs("python");

  console.log(
    "Total Jobs:",
    jobs.length
  );

  console.log(jobs[0]);
})();