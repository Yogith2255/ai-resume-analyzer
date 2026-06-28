import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiBriefcase, FiExternalLink, FiMessageSquare, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiSearch, FiSliders, FiDollarSign, FiAward } from "react-icons/fi";
import useJobs from "../../hooks/useJobs";

export default function Dashboard() {
  const { jobsSections, loading, error, refetch } = useJobs();
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchLocation, setSearchLocation] = useState("");
  const [posTypeFilter, setPosTypeFilter] = useState("All");
  const [workplaceFilter, setWorkplaceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("atsScore");
  const navigate = useNavigate();

  const handleAskCoach = (job) => {
    // Navigate to coach page and pass the job details in state or session
    navigate("/resume-coach", { 
      state: { 
        message: `How can I improve my resume to match the "${job.title}" role at ${job.company}? I am missing these skills: ${job.missingSkills.join(", ")}.`
      } 
    });
  };

  const handleTakeInterview = (job) => {
    navigate("/interview-prep", { 
      state: { 
        jobTitle: job.title,
        jobCompany: job.company,
        jobDescription: job.description,
        jobSkills: job.skills
      } 
    });
  };

  // Get all unique categories for filtering
  const categories = ["All", ...jobsSections.map(sec => sec.title.replace(/[^\w\s/]/g, "").trim())];

  const getATSColor = (score) => {
    if (score >= 80) return "var(--success)";
    if (score >= 50) return "var(--warning)";
    return "var(--error)";
  };

  // Calculate overall match score averages
  const calculateMetrics = () => {
    let totalScore = 0;
    let jobCount = 0;
    let topSection = null;
    let highestScore = 0;

    jobsSections.forEach(sec => {
      sec.jobs.forEach(job => {
        totalScore += job.atsScore;
        jobCount++;
        if (job.atsScore > highestScore) {
          highestScore = job.atsScore;
          topSection = sec.title;
        }
      });
    });

    return {
      averageScore: jobCount > 0 ? Math.round(totalScore / jobCount) : 0,
      totalJobs: jobCount,
      bestMatchCategory: topSection || "None"
    };
  };

  const metrics = calculateMetrics();

  const getNumericSalary = (salaryStr) => {
    if (!salaryStr) return 0;
    const matches = salaryStr.replace(/[^\d]/g, "");
    return matches ? parseInt(matches, 10) : 0;
  };

  // Filter and sort jobs dynamically
  const getFilteredSections = () => {
    const sectionsCopy = jobsSections.map(section => {
      let filteredJobs = section.jobs.filter(job => {
        if (searchLocation.trim() && !job.location.toLowerCase().includes(searchLocation.toLowerCase())) {
          return false;
        }
        if (posTypeFilter !== "All" && job.positionType !== posTypeFilter) {
          return false;
        }
        if (workplaceFilter !== "All" && job.workplace !== workplaceFilter) {
          return false;
        }
        return true;
      });

      filteredJobs.sort((a, b) => {
        if (sortBy === "salary") {
          return getNumericSalary(b.salary) - getNumericSalary(a.salary);
        }
        return b.atsScore - a.atsScore;
      });

      return {
        ...section,
        jobs: filteredJobs
      };
    });

    return (activeCategory === "All" ? sectionsCopy : sectionsCopy.filter(sec => 
      sec.title.replace(/[^\w\s/]/g, "").trim() === activeCategory
    )).filter(sec => sec.jobs.length > 0);
  };

  return (
    <div className="page-container" style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Upper Metrics Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)"
          }}>
            <FiTrendingUp size={28} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>Average ATS Match</p>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "28px", fontWeight: "700" }}>
              {metrics.averageScore}%
            </h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--success)"
          }}>
            <FiBriefcase size={28} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>Total Jobs Analyzed</p>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "28px", fontWeight: "700" }}>
              {metrics.totalJobs} listings
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--warning)"
          }}>
            <FiCheckCircle size={28} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>Best Skill Alignment</p>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "700", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "200px" }}>
              {metrics.bestMatchCategory}
            </h3>
          </div>
        </div>
      </div>

      {/* Main View Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px" }}>Recommended Roles</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 0 0" }}>Live developer listings scored against your parsed resume profile.</p>
        </div>
        <button 
          onClick={refetch}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: "rgba(99, 102, 241, 0.05)"
          }}
        >
          Refresh Feed
        </button>
      </div>

      {/* Sorting and Filtering Panel */}
      <div className="glass-panel" style={{
        padding: "20px",
        marginBottom: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        alignItems: "end"
      }}>
        {/* Search Location */}
        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</label>
          <div style={{ position: "relative" }}>
            <FiMapPin style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dark)" }} />
            <input 
              type="text" 
              placeholder="e.g. Bangalore, Remote" 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Position Type */}
        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Job Type</label>
          <select 
            value={posTypeFilter}
            onChange={(e) => setPosTypeFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "rgba(30, 30, 45, 0.95)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Intern">Internship</option>
            <option value="Contract">Contract</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>

        {/* Workplace */}
        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Workplace</label>
          <select 
            value={workplaceFilter}
            onChange={(e) => setWorkplaceFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "rgba(30, 30, 45, 0.95)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="All">All Environments</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "rgba(30, 30, 45, 0.95)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="atsScore">ATS Match Score</option>
            <option value="salary">Highest Salary</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        paddingBottom: "8px",
        marginBottom: "24px",
        borderBottom: "1px solid var(--border-color)"
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              whiteSpace: "nowrap",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: activeCategory === cat ? "var(--primary)" : "var(--border-color)",
              backgroundColor: activeCategory === cat ? "rgba(99, 102, 241, 0.1)" : "rgba(255, 255, 255, 0.02)",
              color: activeCategory === cat ? "#ffffff" : "var(--text-muted)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error & Loading States */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: "16px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(99, 102, 241, 0.1)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "rotate 0.8s infinite linear"
          }} />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Searching job databases...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: "24px", borderLeft: "4px solid var(--error)", marginBottom: "24px" }}>
          <p style={{ margin: 0, color: "var(--text-main)", fontWeight: "600" }}>Failed to load listings</p>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px" }}>{error}</p>
        </div>
      )}

      {/* Recommended Jobs Render */}
      {!loading && !error && getFilteredSections().length === 0 && (
        <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>No matching jobs found</p>
          <p style={{ margin: "6px 0 0 0", fontSize: "14px" }}>Consider adding more skills to your profile on the Profile page.</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {getFilteredSections().map(section => (
            <div key={section.title} className="jobs-section">
              <h3 style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text-main)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                {section.title}
              </h3>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px"
              }}>
                {section.jobs.map((job, idx) => (
                  <div 
                    key={idx} 
                    className="glass-panel glass-panel-hover"
                    onClick={() => setSelectedJob(job)}
                    style={{
                      padding: "20px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "180px",
                    }}
                  >
                    <div>
                      {/* Job Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                        <h4 style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#ffffff",
                          margin: 0,
                          lineHeight: "1.3",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          maxWidth: "190px"
                        }} title={job.title}>{job.title}</h4>

                        {/* ATS Score badge */}
                        <div style={{
                          backgroundColor: `${getATSColor(job.atsScore)}20`,
                          border: `1px solid ${getATSColor(job.atsScore)}35`,
                          color: getATSColor(job.atsScore),
                          padding: "4px 8px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          whiteSpace: "nowrap"
                        }}>
                          {job.atsScore}% ATS
                        </div>
                      </div>

                      {/* Company & Info */}
                      <p style={{ margin: "6px 0 0 0", fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>
                        {job.company}
                      </p>

                      {/* Job Metadata Tags */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                        <span style={{ fontSize: "11px", backgroundColor: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", color: "var(--primary)", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                          {job.positionType}
                        </span>
                        <span style={{ fontSize: "11px", backgroundColor: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.15)", color: "#f43f5e", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                          {job.workplace}
                        </span>
                        {job.salary && (
                          <span style={{ fontSize: "11px", backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", color: "var(--success)", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                            {job.salary}
                          </span>
                        )}
                      </div>

                      {/* Location & Source */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px", color: "var(--text-dark)", fontSize: "12px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiMapPin />
                          {job.location}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiBriefcase />
                          {job.source}
                        </span>
                      </div>
                    </div>

                    {/* Skill Alignment Tags */}
                    {job.skills && job.skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "16px" }}>
                        {job.skills.slice(0, 3).map((skill, sIdx) => {
                          const isMatched = job.matchedSkills.includes(skill);
                          return (
                            <span 
                              key={sIdx} 
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: isMatched ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.03)",
                                border: "1px solid",
                                borderColor: isMatched ? "rgba(16, 185, 129, 0.15)" : "var(--border-color)",
                                color: isMatched ? "var(--success)" : "var(--text-muted)"
                              }}
                            >
                              {skill}
                            </span>
                          );
                        })}
                        {job.skills.length > 3 && (
                          <span style={{ fontSize: "11px", color: "var(--text-dark)", display: "flex", alignItems: "center" }}>
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOB DETAIL OVERLAY MODAL */}
      {selectedJob && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: "20px",
          animation: "fadeIn 0.2s ease"
        }} onClick={() => setSelectedJob(null)}>
          <div 
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 0.3s ease-out forwards",
              position: "relative"
            }}
          >
            {/* Close trigger */}
            <button 
              onClick={() => setSelectedJob(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-color)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-main)",
                cursor: "pointer"
              }}
            >
              <FiX size={18} />
            </button>

            {/* Modal Header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <span style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  color: "var(--primary)"
                }}>{selectedJob.category}</span>
                <span style={{ fontSize: "13px", color: "var(--text-dark)" }}>Source: {selectedJob.source}</span>
              </div>
              
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", margin: 0 }}>{selectedJob.title}</h3>
              <p style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{selectedJob.company}</p>
              
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginTop: "12px", color: "var(--text-dark)", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><FiMapPin />{selectedJob.location}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><FiBriefcase />{selectedJob.positionType} ({selectedJob.workplace})</span>
                {selectedJob.salary && <span style={{ color: "var(--success)", fontWeight: "600" }}>💰 {selectedJob.salary}</span>}
              </div>
            </div>

            {/* ATS Score display */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-color)",
              padding: "16px 20px",
              borderRadius: "12px",
              margin: "24px 0"
            }}>
              <div>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>ATS Alignment Score</span>
                <h4 style={{ margin: "2px 0 0 0", fontSize: "20px", color: getATSColor(selectedJob.atsScore), fontWeight: "800" }}>
                  {selectedJob.atsScore}% Match
                </h4>
              </div>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: `3px solid ${getATSColor(selectedJob.atsScore)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "14px",
                color: getATSColor(selectedJob.atsScore)
              }}>
                {selectedJob.atsScore}
              </div>
            </div>

            {/* Match Analysis (Skills list) */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", marginBottom: "12px" }}>Skill Analysis</h4>
              
              {/* Matched skills */}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiCheckCircle style={{ color: "var(--success)" }} />
                  Matched Skills ({selectedJob.matchedSkills.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedJob.matchedSkills.map(skill => (
                    <span 
                      key={skill}
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                        color: "var(--success)"
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {selectedJob.matchedSkills.length === 0 && (
                    <span style={{ fontSize: "12px", color: "var(--text-dark)" }}>No matching skills found.</span>
                  )}
                </div>
              </div>

              {/* Missing skills */}
              <div>
                <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiAlertCircle style={{ color: "var(--warning)" }} />
                  Missing Skills ({selectedJob.missingSkills.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedJob.missingSkills.map(skill => (
                    <span 
                      key={skill}
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(245, 158, 11, 0.08)",
                        border: "1px solid rgba(245, 158, 11, 0.15)",
                        color: "var(--warning)"
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {selectedJob.missingSkills.length === 0 && (
                    <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: "600" }}>Awesome! You have all the required skills.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description excerpt */}
            {selectedJob.description && (
              <div style={{ marginBottom: "28px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>Description</h4>
                <div style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "var(--text-muted)",
                  maxHeight: "150px",
                  overflowY: "auto",
                  backgroundColor: "rgba(255,255,255,0.01)",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)"
                }}>
                  {selectedJob.description.replace(/<\/?[^>]+(>|$)/g, "")}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
              <button 
                onClick={() => handleAskCoach(selectedJob)}
                style={{ flex: 1, justifyContent: "center" }}
                className="btn-secondary"
              >
                <FiMessageSquare />
                Ask Coach
              </button>

              <button 
                onClick={() => handleTakeInterview(selectedJob)}
                style={{ 
                  flex: 1.2, 
                  justifyContent: "center",
                  background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)",
                  color: "#ffffff",
                  border: "none"
                }}
                className="btn-primary"
              >
                <FiAward />
                Take Interview
              </button>
              
              {selectedJob.applyUrl && (
                <a 
                  href={selectedJob.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1.2, textDecoration: "none", justifyContent: "center" }}
                  className="btn-primary"
                >
                  Apply Role
                  <FiExternalLink />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation keyframe */}
      <style>{`
        @keyframes rotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Simple internal component to display a Close icon since we only imported FiX
function FiX(props) {
  return (
    <svg 
      stroke="currentColor" 
      fill="none" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      height={props.size || "1em"} 
      width={props.size || "1em"} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}