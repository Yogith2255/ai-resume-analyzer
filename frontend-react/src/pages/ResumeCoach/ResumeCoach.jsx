import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FiSend, FiMessageSquare } from "react-icons/fi";
import { sendMessageToCoach, analyzeJobDescription } from "../../services/coachService";
import toast from "react-hot-toast";

export default function ResumeCoach() {
  const location = useLocation();
  const [messages, setMessages] = useState([
    {
      sender: "coach",
      text: "Hello! I am your CareerLens AI Coach. I have analyzed your resume profile and matching listings. Ask me anything about improving your ATS score, filling skill gaps, or details on projects you can build!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Job Description Analyzer states
  const [jdInput, setJdInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyzeJD = async () => {
    if (!jdInput.trim() || analyzing) return;
    setAnalyzing(true);
    const loadToast = toast.loading("Analyzing job description match...");
    try {
      const data = await analyzeJobDescription(jdInput);
      setAnalysisResult(data);
      toast.success("Job description match calculated!", { id: loadToast });
    } catch (err) {
      toast.error("Failed to analyze job description", { id: loadToast });
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-scroll to bottom on chat update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Handle passed navigation query state
  useEffect(() => {
    if (location.state?.message) {
      handleSendPrompt(location.state.message);
      // Clear location state history so it doesn't trigger on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSendPrompt = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || sending) return;

    // Clear input
    if (!textToSend) setInputValue("");

    // Add user message to state
    const newHistory = [...messages, { sender: "user", text }];
    setMessages(newHistory);
    setSending(true);

    try {
      // Package recent 10 messages for context memory
      const recentHistory = newHistory.slice(-10);
      const data = await sendMessageToCoach(text, recentHistory);
      
      setMessages(prev => [...prev, {
        sender: "coach",
        text: data.response || "I couldn't process that response. Try asking again."
      }]);
    } catch (err) {
      toast.error("Failed to connect to AI Coach");
      setMessages(prev => [...prev, {
        sender: "coach",
        text: "Sorry, I am having trouble connecting to my cognitive services. Please verify your connection and try again."
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  // Simple, robust Markdown parser helper for rendering chat bubbles
  const renderMessageContent = (text) => {
    // Escape html
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code Blocks: ```code```
    formatted = formatted.replace(
      /```([\s\S]*?)```/g,
      '<pre style="background: rgba(0, 0, 0, 0.4); padding: 12px; border-radius: 8px; font-family: monospace; overflow-x: auto; border: 1px solid var(--border-color); margin: 8px 0; font-size: 13px;"><code>$1</code></pre>'
    );

    // Inline Code: `code`
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code style="background: rgba(99, 102, 241, 0.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #a5b4fc;">$1</code>'
    );

    // Bold: **text**
    formatted = formatted.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong style="font-weight: 700; color: #ffffff;">$1</strong>'
    );

    // Headings: ### Heading
    formatted = formatted.replace(
      /###\s+([^\n]+)/g,
      '<h4 style="font-size: 15px; font-weight: 700; color: #ffffff; margin: 12px 0 6px 0;">$1</h4>'
    );

    // Line breaks
    formatted = formatted.split("\n").join("<br />");

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const starterPrompts = [
    { label: "🔍 Check Gaps", query: "What are the biggest skill gaps on my profile for the matching jobs?" },
    { label: "🚀 Project Idea", query: "Suggest a microservice project I can build to improve my resume score." },
    { label: "📄 ATS Optimization", query: "What are 3 ways I can format my resume to score higher in ATS screenings?" }
  ];

  return (
    <div className="page-container" style={{ 
      animation: "fadeIn 0.5s ease",
      height: "calc(100vh - 120px)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px" }}>AI Resume Coach</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 0 0" }}>Interactive suggestions on filling gaps, learning path projects, and resume formatting.</p>
      </div>

      <div className="coach-split-container" style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px",
        minHeight: 0
      }}>
        {/* Left Column: Conversational Coach */}
        <div className="glass-panel" style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          borderRadius: "16px",
          overflow: "hidden"
        }}>
          {/* Messages scroll viewport */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }} className="chat-viewport">
            
            {messages.map((msg, index) => {
              const isCoach = msg.sender === "coach";
              return (
                <div 
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: isCoach ? "flex-start" : "flex-end",
                    width: "100%",
                    animation: "fadeIn 0.3s ease"
                  }}
                >
                  {/* Bubble card */}
                  <div style={{
                    maxWidth: "80%",
                    padding: "16px 20px",
                    borderRadius: "16px",
                    borderTopLeftRadius: isCoach ? "4px" : "16px",
                    borderTopRightRadius: isCoach ? "16px" : "4px",
                    backgroundColor: isCoach ? "rgba(17, 24, 39, 0.5)" : "var(--primary)",
                    border: isCoach ? "1px solid var(--border-color)" : "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}>
                    {renderMessageContent(msg.text)}
                  </div>
                </div>
              );
            })}

            {/* Typing state dot animations */}
            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                <div style={{
                  padding: "12px 20px",
                  borderRadius: "16px",
                  borderTopLeftRadius: "4px",
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span className="dot" style={{ animationDelay: "0s" }} />
                  <span className="dot" style={{ animationDelay: "0.2s" }} />
                  <span className="dot" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Starters */}
          {messages.length === 1 && !sending && (
            <div style={{
              padding: "0 24px 16px 24px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center"
            }}>
              {starterPrompts.map((starter, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendPrompt(starter.query)}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)"
                  }}
                  className="starter-btn"
                >
                  {starter.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "rgba(15, 19, 34, 0.6)",
            display: "flex",
            gap: "12px",
            alignItems: "center"
          }}>
            <textarea
              rows="1"
              placeholder="Ask your career coach..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                color: "#ffffff",
                padding: "12px 16px",
                fontSize: "14px",
                resize: "none",
                fontFamily: "var(--font-family)",
                outline: "none",
                boxSizing: "border-box"
              }}
              className="chat-textarea"
            />
            <button
              onClick={() => handleSendPrompt()}
              disabled={sending || !inputValue.trim()}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "opacity var(--transition-fast)",
                opacity: (sending || !inputValue.trim()) ? 0.5 : 1
              }}
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: Job Description Analyzer */}
        <div className="glass-panel" style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          borderRadius: "16px",
          overflow: "hidden",
          padding: "24px"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>
            Job Description Analyzer
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "16px", lineHeight: "1.4" }}>
            Paste a target job description to match against your skills, check your ATS score, and receive gap-fill projects.
          </p>

          {!analysisResult ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
              <textarea
                placeholder="Paste the job description text here (e.g. requirements, responsibilities)..."
                value={jdInput}
                onChange={(e) => setJdInput(e.target.value)}
                disabled={analyzing}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  padding: "16px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  resize: "none",
                  outline: "none",
                  fontFamily: "var(--font-family)",
                  minHeight: "120px"
                }}
              />
              <button
                onClick={handleAnalyzeJD}
                disabled={analyzing || !jdInput.trim()}
                className="btn-primary"
                style={{ justifyContent: "center", width: "100%" }}
              >
                {analyzing ? "Analyzing..." : "Analyze Job Description"}
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", gap: "20px" }} className="analysis-results-scroll">
              {/* ATS Match Score Indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", padding: "16px 20px", borderRadius: "12px" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: analysisResult.score >= 80 ? "rgba(16, 185, 129, 0.1)" : analysisResult.score >= 50 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: `3px solid ${analysisResult.score >= 80 ? "var(--success)" : analysisResult.score >= 50 ? "var(--warning)" : "var(--error)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "15px",
                  color: analysisResult.score >= 80 ? "var(--success)" : analysisResult.score >= 50 ? "var(--warning)" : "var(--error)",
                  flexShrink: 0
                }}>
                  {analysisResult.score}%
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>
                    ATS Match Score
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    {analysisResult.score >= 80 ? "Excellent alignment!" : analysisResult.score >= 50 ? "Good potential. Add some key skills." : "Significant skill gaps identified."}
                  </p>
                </div>
              </div>

              {/* Match Badges */}
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Matched Skills ({analysisResult.matchedSkills.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {analysisResult.matchedSkills.map(skill => (
                    <span key={skill} style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--success)",
                      backgroundColor: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}>
                      {skill}
                    </span>
                  ))}
                  {analysisResult.matchedSkills.length === 0 && (
                    <span style={{ fontSize: "12px", color: "var(--text-dark)" }}>None matched</span>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Missing Requirements ({analysisResult.missingSkills.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {analysisResult.missingSkills.map(skill => (
                    <span key={skill} style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--error)",
                      backgroundColor: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}>
                      {skill}
                    </span>
                  ))}
                  {analysisResult.missingSkills.length === 0 && (
                    <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: "600" }}>✓ No missing skills!</span>
                  )}
                </div>
              </div>

              {/* Coach Advice */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", marginBottom: "10px" }}>
                  Coach Tailoring Advice
                </h4>
                <div style={{ color: "var(--text-main)", fontSize: "13px", lineHeight: "1.6" }}>
                  {renderMessageContent(analysisResult.coachingResponse)}
                </div>
              </div>

              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setJdInput("");
                }}
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
              >
                Analyze Another Job
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .starter-btn:hover {
          color: #ffffff !important;
          border-color: var(--primary) !important;
          background-color: rgba(99, 102, 241, 0.08) !important;
        }
        .chat-textarea:focus {
          border-color: var(--primary) !important;
        }
        .dot {
          width: 8px;
          height: 8px;
          background-color: var(--text-muted);
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @media (min-width: 1024px) {
          .coach-split-container {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}