const skillDatabase =
require("../data/skills");
  
  function extractJobSkills(text = "") {
    const lowerText = text.toLowerCase();
  
    return skillDatabase.filter(skill => {
        const pattern = new RegExp(
          `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i"
        );
      
        return pattern.test(text);
      });
  }
  
  module.exports = extractJobSkills;