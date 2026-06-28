const { fetchAdzunaJobs } = require("./adzunaService");
const { fetchJoobleJobs } = require("./joobleService");

function extractSalary(title, description, rawSalaryMin, rawSalaryMax) {
  if (rawSalaryMin || rawSalaryMax) {
    if (rawSalaryMin && rawSalaryMax) {
      return `₹${Math.round(rawSalaryMin).toLocaleString()} - ₹${Math.round(rawSalaryMax).toLocaleString()}`;
    }
    return rawSalaryMin ? `₹${Math.round(rawSalaryMin).toLocaleString()}+` : `₹${Math.round(rawSalaryMax).toLocaleString()}`;
  }

  const text = `${title} ${description}`;
  const lpaMatch = text.match(/(\d+\s*-\s*\d+|\d+)\s*(?:LPA|Lakh|lakhs|Lac|lacs)/i);
  if (lpaMatch) return `₹${lpaMatch[1]} LPA`;

  const genericMatch = text.match(/(?:₹|\$)\s*(\d{1,3}(?:,\d{2,3})*(?:\s*-\s*\d{1,3}(?:,\d{2,3})*)?)/);
  if (genericMatch) {
    const symbol = text.includes("₹") ? "₹" : "$";
    return `${symbol}${genericMatch[1]}`;
  }
  
  const lower = title.toLowerCase();
  if (lower.includes("intern")) {
    return "₹3,00,000 - ₹5,00,000";
  } else if (lower.includes("senior") || lower.includes("lead") || lower.includes("architect")) {
    return "₹18,00,000 - ₹28,00,000";
  } else {
    return "₹8,00,000 - ₹15,00,000";
  }
}

function extractPositionType(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("intern") || text.includes("internship") || text.includes("co-op")) return "Intern";
  if (text.includes("contract") || text.includes("contractor") || text.includes("freelance") || text.includes("temporary")) return "Contract";
  if (text.includes("part-time") || text.includes("parttime")) return "Part-time";
  return "Full-time";
}

function extractWorkplace(title, description, location) {
  const text = `${title} ${description} ${location}`.toLowerCase();
  if (text.includes("remote") || text.includes("work from home") || text.includes("wfh")) return "Remote";
  if (text.includes("hybrid")) return "Hybrid";
  return "On-site";
}

async function getAllJobs(search = "software") {
  const adzunaJobs = await fetchAdzunaJobs(search);
  const joobleJobs = await fetchJoobleJobs(search);
  
  const { categorizeJob } = require("../utils/jobCategorizer");
  const extractJobSkills = require("../utils/extractJobSkills");

  const normalizedAdzuna = adzunaJobs.map(job => {
    const title = job.title || "";
    const desc = job.description || "";
    const loc = job.location?.display_name || "Remote";
    return {
      title,
      company: job.company?.display_name || "Unknown",
      location: loc,
      description: desc,
      applyUrl: job.redirect_url || "",
      source: "Adzuna",
      salary: extractSalary(title, desc, job.salary_min, job.salary_max),
      positionType: extractPositionType(title, desc),
      workplace: extractWorkplace(title, desc, loc)
    };
  });

  const normalizedJooble = joobleJobs.map(job => {
    const title = job.title || "";
    const desc = job.snippet || "";
    const loc = job.location || "Remote";
    return {
      title,
      company: job.company || "Unknown",
      location: loc,
      description: desc,
      applyUrl: job.link || "",
      source: "Jooble",
      salary: extractSalary(title, desc, null, null), // Jooble uses post body, we extract via description matching
      positionType: extractPositionType(title, desc),
      workplace: extractWorkplace(title, desc, loc)
    };
  });

  const merged = [
    ...normalizedAdzuna,
    ...normalizedJooble
  ].map(job => ({
    ...job,
    skills: extractJobSkills(job.description)
  }));

  return merged.map(job => ({
    ...job,
    category: categorizeJob(job.title)
  }));
}

module.exports = {
  getAllJobs
};