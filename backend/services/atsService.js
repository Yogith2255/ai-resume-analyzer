const calculateATSScore = require(
    "../utils/atsCalculator"
  );
  
  function analyzeJobMatch(
    resumeSkills,
    jobSkills
  ) {
    return calculateATSScore(
      resumeSkills,
      jobSkills
    );
  }
  
  module.exports = {
    analyzeJobMatch
  };