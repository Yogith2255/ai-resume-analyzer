const {
    analyzeJobMatch
  } = require(
    "../services/atsService"
  );
  
  const resumeSkills = [
    "Python",
    "React",
    "SQL",
    "Node.js",
    "GitHub"
  ];
  
  const jobSkills = [
    "Python",
    "React",
    "AWS",
    "Docker",
    "SQL"
  ];
  
  const result =
    analyzeJobMatch(
      resumeSkills,
      jobSkills
    );
  
  console.log(result);