require("dotenv").config();

const {
  getAllJobs
} = require("./services/jobsService");

(async () => {
  const jobs =
    await getAllJobs("software");

  const categories = {};

  jobs.forEach(job => {
    categories[job.category] =
      (categories[job.category] || 0) + 1;
  });

  console.log(categories);
})();