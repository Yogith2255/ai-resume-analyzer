import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiX, FiCheck } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Resume file size must be less than 10MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF, DOCX, or TXT file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast.error("Please fill in email and password fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(isLogin ? "Signing in..." : "Creating account...");

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Successfully logged in!", { id: loadingToast });
        navigate("/dashboard");
      } else {
        const formData = new FormData();
        formData.append("fullName", fullName.trim());
        formData.append("email", email.trim());
        formData.append("password", password);
        if (resumeFile) {
          formData.append("resume", resumeFile);
        }
        
        await register(formData);
        toast.success("Registration complete!", { id: loadingToast });
        navigate("/dashboard");
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || (isLogin ? "Login failed" : "Registration failed");
      toast.error(errMsg, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTab = (loginTab) => {
    setIsLogin(loginTab);
    // Clear all inputs on toggle to prevent state carryover
    setFullName("");
    setEmail("");
    setPassword("");
    setResumeFile(null);
  };

  return (
    <div className="auth-page">
      {/* Visual branding container */}
      <div className="auth-left">
        <div className="logo">
          <span>✦</span>
          <h2>CareerLens</h2>
        </div>

        <p className="tag">YOUR CAREER, CLEARER</p>

        <h1>
          Make your resume
          <br />
          work harder.
        </h1>

        <p className="description">
          Upload your resume and immediately see how your skills align with live software listings. Receive real-time ATS keyword recommendations and interact with your personal AI Resume Coach.
        </p>

        <div className="features">
          <div>
            <span>✓</span> Live resume-aware job matches
          </div>
          <div>
            <span>✓</span> Direct ATS matching & skill gap reports
          </div>
          <div>
            <span>✓</span> AI Career Coach conversational advice
          </div>
        </div>
      </div>

      {/* Authentication Card Section */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="tabs">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => toggleTab(true)}
            >
              Sign In
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => toggleTab(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                key="register-fullname"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                required
              />
            )}

            <input
              key={isLogin ? "login-email" : "register-email"}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />

            <input
              key={isLogin ? "login-password" : "register-password"}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />

            {!isLogin && (
              <>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />

                {resumeFile ? (
                  <div className="file-selected-badge">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FiCheck size={16} />
                      <span style={{ fontWeight: "500", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "200px", whiteSpace: "nowrap" }}>
                        {resumeFile.name}
                      </span>
                    </div>
                    <button type="button" onClick={handleRemoveFile}>
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    className="upload-box"
                    onClick={handleUploadBoxClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <FiUploadCloud className="upload-icon" />
                    <p>Click or drag your resume here</p>
                    <span>PDF, DOCX, or TXT (Max 10MB)</span>
                  </div>
                )}
              </>
            )}

            <button 
              type="submit" 
              className="btn-primary primary-btn"
              disabled={submitting}
              style={{ justifyContent: "center", width: "100%" }}
            >
              {submitting ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}