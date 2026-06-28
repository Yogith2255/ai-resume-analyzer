import { useState, useRef } from "react";
import { FiUploadCloud, FiFileText, FiPlus, FiX, FiCheck } from "react-icons/fi";
import useProfile from "../../hooks/useProfile";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const SKILL_CATEGORIES = {
  "Languages": ["Python", "Java", "JavaScript", "TypeScript", "C", "C++"],
  "Frontend": ["React", "Angular", "Vue", "HTML", "CSS", "Bootstrap", "Tailwind CSS"],
  "Backend": ["Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot"],
  "Databases": ["SQL", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis"],
  "AI / ML": ["Machine Learning", "Deep Learning", "Data Science", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy"],
  "Cloud & DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Jenkins"],
  "Tools": ["Git", "GitHub", "Postman", "REST API", "GraphQL", "FAISS", "RAG", "Gemini AI"]
};

export default function Profile() {
  const { user } = useAuth();
  const { skills, loading, uploading, error, uploadResumeFile, addSkill, removeSkill } = useProfile();
  
  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const loadToast = toast.loading("Uploading and parsing resume...");
      try {
        await uploadResumeFile(file);
        toast.success("Resume parsed successfully!", { id: loadToast });
      } catch (err) {
        toast.error("Failed to parse resume", { id: loadToast });
      }
    }
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    if (skills.some(s => s.toLowerCase() === newSkill.trim().toLowerCase())) {
      toast.error("Skill already exists on your profile");
      return;
    }

    try {
      await addSkill(newSkill.trim());
      toast.success(`Added "${newSkill.trim()}"`);
      setNewSkill("");
    } catch (err) {
      toast.error("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillName) => {
    try {
      await removeSkill(skillName);
      toast.success(`Removed "${skillName}"`);
    } catch (err) {
      toast.error("Failed to remove skill");
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Group user's current skills by their category mapping
  const getGroupedSkills = () => {
    const grouped = {};
    Object.keys(SKILL_CATEGORIES).forEach(cat => {
      grouped[cat] = [];
    });
    grouped["Other"] = [];

    skills.forEach(skill => {
      let matched = false;
      Object.entries(SKILL_CATEGORIES).forEach(([cat, list]) => {
        if (list.some(item => item.toLowerCase() === skill.toLowerCase())) {
          grouped[cat].push(skill);
          matched = true;
        }
      });
      if (!matched) {
        grouped["Other"].push(skill);
      }
    });

    return grouped;
  };

  const groupedSkills = getGroupedSkills();

  return (
    <div className="page-container" style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px" }}>Profile & Resume Settings</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 0 0" }}>Update your resume and edit extracted developer skills.</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "30px",
        alignItems: "flex-start"
      }} className="profile-layout-grid">
        
        {/* SECTION 1: Resume Upload / Manager */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiFileText style={{ color: "var(--primary)" }} /> Resume Management
          </h3>

          {user?.resume ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-color)",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", overflow: "hidden" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  flexShrink: 0
                }}>
                  <FiFileText size={24} />
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#ffffff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "300px" }}>
                    {user.resume.name}
                  </h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-dark)" }}>
                    Size: {formatBytes(user.resume.size)} | Format: {user.resume.contentType?.split("/")[1]?.toUpperCase() || "PDF"}
                  </p>
                </div>
              </div>
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: "700",
                color: "var(--success)",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                whiteSpace: "nowrap"
              }}>
                <FiCheck /> Current Active
              </span>
            </div>
          ) : (
            <div style={{
              padding: "24px",
              backgroundColor: "rgba(245, 158, 11, 0.05)",
              border: "1px solid rgba(245, 158, 11, 0.15)",
              borderRadius: "12px",
              color: "var(--warning)",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "24px"
            }}>
              No active resume uploaded. Please upload a resume to unlock live job recommendations.
            </div>
          )}

          {/* Trigger input select */}
          <input 
            type="file" 
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />

          <button 
            className="btn-primary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            <FiUploadCloud />
            {uploading ? "Parsing Resume..." : "Upload New Resume & Reparse"}
          </button>
        </div>

        {/* SECTION 2: Skills Profile */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", marginBottom: "24px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", margin: 0 }}>Skills Portfolio</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>Adding or removing skills will recalculate your ATS job matches.</p>
            </div>
            
            {/* Add skill manual form */}
            <form onSubmit={handleAddSkillSubmit} style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "340px" }}>
              <input 
                type="text" 
                placeholder="Add skill (e.g. AWS, Git...)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="input-field"
                style={{ padding: "10px 14px", fontSize: "14px" }}
              />
              <button type="submit" className="btn-primary" style={{ padding: "10px 16px" }}>
                <FiPlus size={18} />
              </button>
            </form>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>Loading skills...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {Object.entries(groupedSkills).map(([cat, list]) => {
                if (list.length === 0) return null;
                return (
                  <div key={cat} style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                    paddingBottom: "20px"
                  }}>
                    <h4 style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--primary)",
                      letterSpacing: "0.5px",
                      marginBottom: "12px",
                      textTransform: "uppercase"
                    }}>{cat}</h4>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {list.map(skill => (
                        <div 
                          key={skill}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-color)",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            color: "var(--text-main)",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "all var(--transition-fast)"
                          }}
                          className="skill-chip"
                        >
                          <span>{skill}</span>
                          <button 
                            onClick={() => handleRemoveSkill(skill)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-dark)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              padding: 0
                            }}
                            className="skill-delete-btn"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {skills.length === 0 && (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-dark)", fontSize: "14px" }}>
                  No skills listed on your profile yet. Upload a resume to automatically extract keywords!
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <style>{`
        .skill-chip:hover {
          border-color: rgba(99, 102, 241, 0.3) !important;
          background-color: rgba(99, 102, 241, 0.05) !important;
        }
        .skill-delete-btn:hover {
          color: var(--error) !important;
        }
        @media (min-width: 1024px) {
          .profile-layout-grid {
            grid-template-columns: 340px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}