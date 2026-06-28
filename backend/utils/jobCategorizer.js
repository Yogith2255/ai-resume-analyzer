function categorizeJob(title = "") {
  const t = title.toLowerCase();

  if (
    t.includes("machine learning") ||
    t.includes("artificial intelligence") ||
    t.includes("deep learning") ||
    t.includes("computer vision") ||
    t.includes("nlp") ||
    t.includes("ai engineer")
  ) {
    return "AI / ML";
  }

  if (
    t.includes("data scientist") ||
    t.includes("data analyst") ||
    t.includes("data engineer")
  ) {
    return "Data Science";
  }

  if (
    t.includes("full stack") ||
    t.includes("fullstack") ||
    t.includes("mern") ||
    t.includes("mean")
  ) {
    return "Full Stack";
  }

  if (
    t.includes("react") ||
    t.includes("frontend") ||
    t.includes("front end") ||
    t.includes("angular") ||
    t.includes("vue") ||
    t.includes("ui")
  ) {
    return "Frontend";
  }

  if (
    t.includes("devops") ||
    t.includes("site reliability")
  ) {
    return "DevOps";
  }

  if (
    t.includes("security") ||
    t.includes("cyber")
  ) {
    return "Cyber Security";
  }

  if (
    t.includes("android") ||
    t.includes("ios") ||
    t.includes("flutter") ||
    t.includes("react native")
  ) {
    return "Mobile Development";
  }

  if (
    t.includes("intern") ||
    t.includes("graduate") ||
    t.includes("fresher") ||
    t.includes("trainee")
  ) {
    return "Freshers";
  }

  if (
    t.includes("aws") ||
    t.includes("cloud")
  ) {
    return "Cloud";
  }

  if (
    t.includes("backend") ||
    t.includes("node") ||
    t.includes("java") ||
    t.includes("python developer") ||
    t.includes("software engineer") ||
    t.includes("software developer") ||
    t.includes("application developer") ||
    t.includes("sde")
  ) {
    return "Backend";
  }

  return "Other";
}

module.exports = {
  categorizeJob
};