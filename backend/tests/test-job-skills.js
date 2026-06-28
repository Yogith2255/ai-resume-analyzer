require("dotenv").config();

const {
  getAllJobs
} = require("../services/jobsService");

(async () => {
  const jobs = await getAllJobs("python");

  console.log("TITLE:");
  console.log(jobs[0].title);

  console.log("\nSKILLS:");
  console.log(jobs[0].skills);
})();