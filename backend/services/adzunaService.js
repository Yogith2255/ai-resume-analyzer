const axios = require("axios");

async function fetchAdzunaJobs(search = "software") {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    const url =
      `https://api.adzuna.com/v1/api/jobs/in/search/1` +
      `?app_id=${appId}` +
      `&app_key=${appKey}` +
      `&results_per_page=50` +
      `&what=${encodeURIComponent(search)}`;

    const response = await axios.get(url);

    return response.data.results || [];
  } catch (error) {
    console.error("Adzuna Error:", error.message);
    return [];
  }
}

module.exports = {
  fetchAdzunaJobs
};