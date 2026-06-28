function calculateATSScore(
    resumeSkills,
    jobSkills
  ) {
    const resumeSet = new Set(
      resumeSkills.map(s =>
        s.toLowerCase()
      )
    );
  
    const matchedSkills = [];
    const missingSkills = [];
  
    jobSkills.forEach(skill => {
      if (
        resumeSet.has(
          skill.toLowerCase()
        )
      ) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });
  
    const baseScore =
      jobSkills.length === 0
        ? 0
        : (
            matchedSkills.length /
            jobSkills.length
          ) * 100;
  
          const confidence =
          Math.max(
            0.7,
            Math.min(jobSkills.length / 5, 1)
          );
        
        const finalScore =
          Math.round(baseScore * confidence);
  
    return {
      score: finalScore,
      matchedSkills,
      missingSkills
    };
  }
  
  module.exports =
    calculateATSScore;