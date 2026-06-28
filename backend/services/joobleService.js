const axios = require("axios");

async function fetchJoobleJobs(search = "software") {
  try {
    const apiKey = process.env.JOOBLE_API_KEY;

    const url =
      `https://jooble.org/api/${apiKey}`;

    const response = await axios.post(url, {
      keywords: search,
      location: "India"
    });

    return response.data.jobs || [];
  } catch (error) {
    console.error("Jooble Error:", error.message);
    return [];
  }
}

module.exports = {
  fetchJoobleJobs
};