const skillDatabase =
require("../data/skills");
  
function extractSkills(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();

  return skillDatabase.filter(skill => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:\\b|(?<=[^a-zA-Z0-9_#+.-]|^))${escaped}(?:\\b|(?=[^a-zA-Z0-9_#+.-]|$))`, 'i');
    return regex.test(lowerText);
  });
}
  
  module.exports = extractSkills;