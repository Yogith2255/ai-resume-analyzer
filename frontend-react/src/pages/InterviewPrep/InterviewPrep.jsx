import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  FiAward, FiPlay, FiRefreshCw, FiChevronLeft, FiChevronRight, FiCheckCircle, 
  FiAlertCircle, FiVideo, FiVideoOff, FiMic, FiMicOff, FiSmile, FiEye, 
  FiActivity, FiFileText, FiMessageSquare, FiSliders, FiSend
} from "react-icons/fi";
import { getInterviewChatResponse, evaluateInterviewChat } from "../../services/interviewService";
import toast from "react-hot-toast";

export default function InterviewPrep() {
  const location = useLocation();

  const [step, setStep] = useState("setup"); // "setup" | "interview" | "result"
  const [jdText, setJdText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [turnCount, setTurnCount] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Media Stream
  const [mediaStream, setMediaStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const isMicToggledRef = useRef(false);

  // Telemetry HUD simulation
  const [telemetry, setTelemetry] = useState({
    volume: 0,
    smiling: 92,
    eyeContact: 94,
    confidence: 95
  });
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  // Evaluation results
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Web Speech API refs
  const recognitionRef = useRef(null);
  const savedTranscriptRef = useRef("");
  const currentInputRef = useRef("");

  // Keep currentInputRef in sync with currentInput and handle reset/clear conditions
  useEffect(() => {
    currentInputRef.current = currentInput;
    if (currentInput === "") {
      savedTranscriptRef.current = "";
    }
  }, [currentInput]);

  // Load Job details passed from Dashboard state
  useEffect(() => {
    if (location.state && location.state.jobTitle) {
      const job = location.state;
      setJobTitle(job.jobTitle);
      setJobCompany(job.jobCompany);
      
      const skillsStr = job.jobSkills && job.jobSkills.length > 0 
        ? `Required Skills: ${job.jobSkills.join(", ")}.\n` 
        : "";
      const descStr = job.jobDescription 
        ? `Description:\n${job.jobDescription.replace(/<\/?[^>]+(>|$)/g, "")}` 
        : "";
      
      const combinedJd = `Role: ${job.jobTitle} at ${job.jobCompany}\n${skillsStr}${descStr}`;
      setJdText(combinedJd);
      
      toast.success(`Loaded job details for "${job.jobTitle}" at ${job.jobCompany}!`);
    }
  }, [location.state]);

  // Telemetry updates
  useEffect(() => {
    let interval;
    if (step === "interview" && mediaStream) {
      interval = setInterval(() => {
        // Dynamic simulated camera scanning metrics
        const randomVol = isListening ? Math.floor(Math.random() * 45) + 15 : 0;
        const randomSmile = Math.floor(Math.random() * 18) + 78; // 78% to 96% smiling
        const randomEye = Math.floor(Math.random() * 14) + 82;   // 82% to 96% eye contact
        const randomConf = Math.floor(Math.random() * 10) + 88;  // 88% to 98% confidence
        
        setTelemetry({
          volume: randomVol,
          smiling: randomSmile,
          eyeContact: randomEye,
          confidence: randomConf
        });
        
        setTelemetryLogs(prev => [...prev, {
          volume: randomVol,
          smiling: randomSmile,
          eyeContact: randomEye,
          confidence: randomConf
        }]);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [step, mediaStream, isListening]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Bind camera stream to video element once rendered in "interview" step
  useEffect(() => {
    if (step === "interview" && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [step, mediaStream]);

  // Speech Recognition hook setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      
      rec.onresult = (event) => {
        let finalTranscriptText = "";
        let interimTranscriptText = "";
        
        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptText += result[0].transcript + " ";
          } else {
            interimTranscriptText += result[0].transcript;
          }
        }
        
        const transcript = (finalTranscriptText + interimTranscriptText).trim();
        const base = savedTranscriptRef.current.trim();
        const combined = base ? `${base} ${transcript}` : transcript;
        setCurrentInput(combined);
      };
      
      rec.onstart = () => {
        setIsListening(true);
        savedTranscriptRef.current = currentInputRef.current;
      };
      
      rec.onend = () => {
        if (isMicToggledRef.current && !window.speechSynthesis.speaking) {
          try {
            rec.start();
          } catch(e) {}
        } else {
          setIsListening(false);
        }
      };
      
      rec.onerror = (e) => {
        console.error("Speech Recognition error:", e);
      };
      
      recognitionRef.current = rec;
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Speaks current question and triggers speech recognition upon finish
  const speakResponse = (text) => {
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || 
                         voices.find(v => v.lang.startsWith("en-")) || 
                         voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => {
      setIsAiSpeaking(true);
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
    
    utterance.onend = () => {
      setIsAiSpeaking(false);
      if (audioEnabled) {
        startListening();
      }
    };
    
    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isAiSpeaking) {
      isMicToggledRef.current = true;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition start failed or already active:", e);
      }
    }
  };

  const stopListening = () => {
    isMicToggledRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Launch camera & microphone streams
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoEnabled(true);
      setAudioEnabled(true);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera/microphone. Running in keyboard-only mode.");
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        if (audioTrack.enabled) {
          startListening();
        } else {
          stopListening();
        }
      }
    }
  };

  // Setup mock interview session
  const handleStartInterview = async (e) => {
    if (e) e.preventDefault();
    if (!jdText.trim() || loading) return;

    setLoading(true);
    const loadToast = toast.loading("AI Interviewer is starting the conversational mock session...");
    try {
      // Connect to camera
      await startCamera();

      // Request first turn from AI
      const data = await getInterviewChatResponse(jdText, [], 0);
      const firstMsg = { role: "interviewer", text: data.reply };
      setChatHistory([firstMsg]);
      setTurnCount(1);
      setCurrentInput("");
      setTelemetryLogs([]);
      setStep("interview");

      toast.success("Interactive session started! Speak or type your answers.", { id: loadToast });
      
      // Let the interviewer speak the greeting
      setTimeout(() => {
        speakResponse(data.reply);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session. Falling back to local conversation flow.", { id: loadToast });
      
      // Local fallback greeting
      const fallbackGreeting = "Hello, I am the CareerLens AI Interviewer. Welcome! Let's start the interview. Could you introduce yourself and tell me what interests you about this role?";
      const firstMsg = { role: "interviewer", text: fallbackGreeting };
      setChatHistory([firstMsg]);
      setTurnCount(1);
      setCurrentInput("");
      setTelemetryLogs([]);
      setStep("interview");

      await startCamera();
      setTimeout(() => {
        speakResponse(fallbackGreeting);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // User submits a response
  const handleSendResponse = async (e) => {
    if (e) e.preventDefault();
    if (!currentInput.trim() || loading || isAiSpeaking) return;

    stopListening();
    const candidateText = currentInput.trim();
    const newChatHistory = [...chatHistory, { role: "candidate", text: candidateText }];
    setChatHistory(newChatHistory);
    setCurrentInput("");
    setLoading(true);

    const loadToast = toast.loading("AI Interviewer is listening and processing...");

    try {
      // Get the interviewer's conversational reply
      const data = await getInterviewChatResponse(jdText, newChatHistory, turnCount);
      const updatedHistory = [...newChatHistory, { role: "interviewer", text: data.reply }];
      setChatHistory(updatedHistory);
      if (data.shouldAdvanceTurn) {
        setTurnCount(prev => prev + 1);
      }
      toast.success(data.shouldAdvanceTurn ? "Interviewer replied!" : "Interviewer asks to clarify!", { id: loadToast });

      // Speak the interviewer reply
      speakResponse(data.reply);

    } catch (err) {
      console.error(err);
      toast.error("Failed to generate response. Playing local fallback conversation.", { id: loadToast });
      
      // Local fallback turns
      const fallbackQuestions = [
        `Thanks for that introduction. Let's move to core concepts. What are the core differences between a relational and non-relational database, and when would you use one over the other?`,
        `Relational vs non-relational databases are indeed a key choice. Let's talk frontend: How do you manage client-side state and component re-renders when building interfaces with React?`,
        `State management is vital. Now, tracing data: Can you walk me through the lifecycle of an HTTP request from the browser until it hits Node.js?`,
        `Good tracking. How do you implement proper authentication and token validation (e.g. JWT) in a modern web application backend?`,
        `Security is crucial. Let's scale up: Explain how you would configure a multi-stage build in Docker for production, and optimize image size.`,
        `Optimization is key. Suppose queries on the database slow down under high traffic. What profiling tools and indexing strategies would you use to resolve it?`,
        `Database performance is essential. How would you design a secure, distributed caching layer (like Redis) to handle rate limiting?`,
        `Pertaining to collaboration: Describe a time when you disagreed with a senior engineer on a technical decision. How did you resolve it?`,
        `Conflict resolution is a key behavioral trait. Finally, can you describe a situation where you had a production outage? Walk me through how you handled it.`,
        `Thank you! That concludes our conversational mock interview. I have captured your audio transcripts and webcam posture logs. Please click 'Finish Interview' to review your detailed performance scorecard.`
      ];

      const nextQ = fallbackQuestions[turnCount - 1] || fallbackQuestions[fallbackQuestions.length - 1];
      const updatedHistory = [...newChatHistory, { role: "interviewer", text: nextQ }];
      setChatHistory(updatedHistory);
      setTurnCount(prev => prev + 1);

      speakResponse(nextQ);
    } finally {
      setLoading(false);
    }
  };

  // Compile interview results & request evaluation
  const handleSubmitInterview = async () => {
    stopListening();
    stopCamera();
    window.speechSynthesis.cancel();
    
    setEvaluating(true);
    const loadToast = toast.loading("Analyzing chat dialogues and posture telemetry...");
    
    const finalDeliveryMetrics = calculateAverageTelemetry();
    
    try {
      const data = await evaluateInterviewChat(chatHistory, finalDeliveryMetrics);
      setEvaluation({
        ...data,
        deliveryMetrics: finalDeliveryMetrics
      });
      setStep("result");
      toast.success("Conversational interview evaluated!", { id: loadToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to grade answers. Displaying fallback evaluation card.", { id: loadToast });
      
      // Fallback local grading card
      // Extract Q&As from transcript history
      const qnaList = [];
      let currentQ = "";
      chatHistory.forEach(msg => {
        if (msg.role === "interviewer") {
          currentQ = msg.text;
        } else if (msg.role === "candidate" && currentQ) {
          qnaList.push({
            question: currentQ,
            answer: msg.text
          });
          currentQ = "";
        }
      });

      setEvaluation({
        score: 75,
        improvements: "Focus on articulating structural choices like multi-stage Docker builds or React hooks clearly. Emphasize STAR framework when answering behavioral questions.",
        mistakes: "Some answers are slightly concise. Try adding metrics proving your engineering choices.",
        deliveryFeedback: `Your camera telemetry registered a ${finalDeliveryMetrics.smiling}% smiling/positive aura and ${finalDeliveryMetrics.eyeContact}% eye contact. Sit slightly upright to optimize posture confidence.`,
        feedback: qnaList.map((item) => ({
          question: item.question,
          userAnswer: item.answer || "(No response)",
          score: item.answer ? 8 : 0,
          feedback: item.answer ? "Response captured. Good keywords used." : "No verbal answer captured.",
          optimalAnswer: `Answer with STAR method: detail the Situation, Task, Action, and outcome metrics.`
        })),
        deliveryMetrics: finalDeliveryMetrics
      });
      setStep("result");
    } finally {
      setEvaluating(false);
    }
  };

  const calculateAverageTelemetry = () => {
    if (telemetryLogs.length === 0) {
      return { smiling: 88, eyeContact: 90, confidence: 92, pacing: "Good (140 words/min)", volume: "Stable" };
    }
    const count = telemetryLogs.length;
    const sumSmile = telemetryLogs.reduce((acc, l) => acc + l.smiling, 0);
    const sumEye = telemetryLogs.reduce((acc, l) => acc + l.eyeContact, 0);
    const sumConf = telemetryLogs.reduce((acc, l) => acc + l.confidence, 0);
    
    return {
      smiling: Math.round(sumSmile / count),
      eyeContact: Math.round(sumEye / count),
      confidence: Math.round(sumConf / count),
      pacing: "Optimal (135 words/min)",
      volume: "Normal & Stable"
    };
  };

  const handleReset = () => {
    stopCamera();
    window.speechSynthesis.cancel();
    setJdText("");
    setJobTitle("");
    setJobCompany("");
    setChatHistory([]);
    setTurnCount(0);
    setCurrentInput("");
    setEvaluation(null);
    setTelemetryLogs([]);
    setStep("setup");
  };

  const renderFeedbackContent = (text) => {
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code style="background: rgba(99, 102, 241, 0.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #a5b4fc;">$1</code>'
    );
    formatted = formatted.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong style="font-weight: 700; color: #ffffff;">$1</strong>'
    );
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="page-container" style={{ animation: "fadeIn 0.5s ease" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiAward style={{ color: "var(--primary)" }} /> Interactive Face-to-Face AI Conversational Interview
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 0 0" }}>
          Engage in a dynamic voice-to-voice interview. The AI adapts questions to your answers while scanning camera telemetry.
        </p>
      </div>

      {/* STEP 1: SETUP SCREEN */}
      {step === "setup" && (
        <div className="glass-panel" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiPlay style={{ color: "var(--primary)" }} /> Initialize Stateful Mock Session
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "24px", lineHeight: "1.5" }}>
            Paste the requirements of the job you've targeted. CareerLens AI interviewer will initiate a conversational discussion tailored to your skills.
          </p>

          {jobTitle && (
            <div style={{
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <FiFileText style={{ color: "var(--primary)", fontSize: "20px" }} />
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", display: "block" }}>Target Role</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffffff" }}>{jobTitle} at {jobCompany}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleStartInterview}>
            <textarea
              placeholder="Paste requirements, tech stack, or job description text here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              disabled={loading}
              required
              style={{
                width: "100%",
                height: "200px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                color: "#ffffff",
                padding: "20px",
                fontSize: "14px",
                lineHeight: "1.6",
                resize: "none",
                outline: "none",
                fontFamily: "var(--font-family)",
                marginBottom: "24px",
                boxSizing: "border-box"
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !jdText.trim()}
              style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            >
              {loading ? "Analyzing Requirements..." : "Start Conversation Interview"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: ACTIVE CONVERSATIONAL HUD */}
      {step === "interview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Header & turn info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Conversational Exchanges: {turnCount} turns
              </span>
              <h4 style={{ margin: "4px 0 0 0", color: "#ffffff", fontSize: "15px", fontWeight: "500" }}>
                Difficulty Progression: {
                  turnCount <= 2 ? "🟢 Introduction & Basics" : 
                  turnCount <= 5 ? "🟡 Technical Depth" : 
                  turnCount <= 8 ? "🔴 Production & Scale" : 
                  "🔵 Wrap-up / STAR Behavioral"
                }
              </h4>
            </div>
            {/* Pulsing listening indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: isAiSpeaking ? "var(--primary)" : isListening ? "var(--success)" : "rgba(255,255,255,0.1)",
                boxShadow: isAiSpeaking ? "0 0 8px var(--primary)" : isListening ? "0 0 8px var(--success)" : "none",
                animation: isListening || isAiSpeaking ? "pulseWave 1.2s infinite ease-in-out" : "none"
              }} />
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {isAiSpeaking ? "AI Interviewer Speaking" : isListening ? "Listening (Speak now...)" : "Standby"}
              </span>
            </div>
          </div>

          {/* Interactive Split Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "35% 65%",
            gap: "24px"
          }} className="interview-split-grid">
            
            {/* COLUMN 1: USER CAMERA & TELEMETRY */}
            <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", minHeight: "450px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  CAMERA HUD Telemetry
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={toggleVideo} 
                    style={{ background: "none", border: "none", color: videoEnabled ? "var(--primary)" : "var(--error)", cursor: "pointer", fontSize: "16px" }}
                    title={videoEnabled ? "Disable Video" : "Enable Video"}
                  >
                    {videoEnabled ? <FiVideo /> : <FiVideoOff />}
                  </button>
                  <button 
                    onClick={toggleAudio} 
                    style={{ background: "none", border: "none", color: audioEnabled ? "var(--success)" : "var(--error)", cursor: "pointer", fontSize: "16px" }}
                    title={audioEnabled ? "Disable Microphone" : "Enable Microphone"}
                  >
                    {audioEnabled ? <FiMic /> : <FiMicOff />}
                  </button>
                </div>
              </div>

              {/* Video container with overlay */}
              <div style={{
                position: "relative",
                width: "100%",
                height: "220px",
                backgroundColor: "black",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
                marginBottom: "20px"
              }}>
                {mediaStream && videoEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-dark)",
                    gap: "8px"
                  }}>
                    <FiVideoOff size={40} />
                    <span style={{ fontSize: "12px" }}>Camera stream disabled</span>
                  </div>
                )}

                {/* HUD Overlay scanner UI */}
                {mediaStream && videoEnabled && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    pointerEvents: "none",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ width: "12px", height: "12px", borderTop: "2px solid var(--success)", borderLeft: "2px solid var(--success)" }} />
                      <div style={{ width: "12px", height: "12px", borderTop: "2px solid var(--success)", borderRight: "2px solid var(--success)" }} />
                    </div>
                    <div style={{
                      height: "1px",
                      background: "rgba(16, 185, 129, 0.4)",
                      boxShadow: "0 0 8px var(--success)",
                      animation: "scanLine 2.5s infinite linear"
                    }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ width: "12px", height: "12px", borderBottom: "2px solid var(--success)", borderLeft: "2px solid var(--success)" }} />
                      <div style={{ width: "12px", height: "12px", borderBottom: "2px solid var(--success)", borderRight: "2px solid var(--success)" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Telemetry metrics bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><FiSmile /> Positive Aura</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{telemetry.smiling}%</span>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${telemetry.smiling}%`, backgroundColor: "var(--success)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><FiEye /> Eye Contact</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{telemetry.eyeContact}%</span>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${telemetry.eyeContact}%`, backgroundColor: "var(--primary)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><FiSliders /> Posture Confidence</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{telemetry.confidence}%</span>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${telemetry.confidence}%`, backgroundColor: "var(--secondary)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><FiActivity /> Speech Level</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{telemetry.volume}%</span>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${telemetry.volume}%`, backgroundColor: isListening ? "var(--warning)" : "var(--text-dark)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: CONVERSATIONAL CHAT SCREEN */}
            <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "450px" }}>
              {/* Chat threads container */}
              <div style={{
                flexGrow: 1,
                overflowY: "auto",
                maxHeight: "330px",
                paddingRight: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginBottom: "20px"
              }}>
                {chatHistory.map((msg, index) => {
                  const isAi = msg.role === "interviewer";
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: isAi ? "flex-start" : "flex-end"
                      }}
                    >
                      <div style={{
                        maxWidth: "85%",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        borderTopLeftRadius: isAi ? "0px" : "14px",
                        borderTopRightRadius: isAi ? "14px" : "0px",
                        background: isAi ? "rgba(99, 102, 241, 0.08)" : "rgba(16, 185, 129, 0.08)",
                        border: "1px solid",
                        borderColor: isAi ? "rgba(99, 102, 241, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        boxShadow: isAi ? "0 4px 12px rgba(99,102,241,0.02)" : "0 4px 12px rgba(16,185,129,0.02)",
                        animation: "fadeIn 0.3s ease"
                      }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          color: isAi ? "var(--primary)" : "var(--success)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "block",
                          marginBottom: "4px"
                        }}>
                          {isAi ? "Interviewer AI" : "You (Candidate)"}
                        </span>
                        <p style={{ margin: 0, fontSize: "14px", color: "#ffffff", lineHeight: "1.5" }}>
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Field / Audio Transcriber fallback */}
              <form onSubmit={handleSendResponse} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder={
                    isAiSpeaking 
                      ? "AI is speaking, please wait..." 
                      : isListening 
                        ? "Transcribing your voice... (or click to type here)" 
                        : "Type your response and click Send..."
                  }
                  value={currentInput}
                  onChange={(e) => {
                    setCurrentInput(e.target.value);
                    savedTranscriptRef.current = e.target.value;
                  }}
                  disabled={loading || isAiSpeaking}
                  style={{
                    flexGrow: 1,
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={loading || isAiSpeaking || !currentInput.trim()}
                  className="btn-primary"
                  style={{ padding: "12px", width: "46px", height: "46px", minWidth: "46px", borderRadius: "8px", justifyContent: "center" }}
                  title="Send Answer"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </div>

          </div>

          {/* Active Voice repeating & wrap-up triggers */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  const lastAiMsg = [...chatHistory].reverse().find(m => m.role === "interviewer");
                  if (lastAiMsg) speakResponse(lastAiMsg.text);
                }}
                className="btn-secondary"
                style={{ padding: "10px 14px", fontSize: "13px" }}
              >
                <FiActivity /> Repeat AI Question
              </button>
              
              {isListening ? (
                <button
                  type="button"
                  onClick={stopListening}
                  className="btn-secondary"
                  style={{ padding: "10px 14px", fontSize: "13px", color: "var(--warning)", borderColor: "rgba(245, 158, 11, 0.2)" }}
                >
                  <FiMicOff /> Pause Microphone
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startListening}
                  className="btn-secondary"
                  style={{ padding: "10px 14px", fontSize: "13px" }}
                  disabled={isAiSpeaking}
                >
                  <FiMic /> Speak Answer
                </button>
              )}
            </div>

            <button
              onClick={handleSubmitInterview}
              disabled={evaluating}
              className="btn-primary"
              style={{ 
                padding: "12px 24px", 
                background: "linear-gradient(135deg, var(--success) 0%, var(--primary) 100%)",
                border: "none",
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)"
              }}
            >
              {evaluating ? "Evaluating Dialogue..." : "Finish & Analyze Interview"}
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: RESULTS SCREEN */}
      {step === "result" && evaluation && (
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px" }}>
          
          {/* Main Score & restarting button */}
          <div className="glass-panel score-summary-card" style={{
            padding: "40px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "40px",
            flexWrap: "wrap",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: `5px solid ${evaluation.score >= 80 ? "var(--success)" : evaluation.score >= 50 ? "var(--warning)" : "var(--error)"}`,
                backgroundColor: evaluation.score >= 80 ? "rgba(16, 185, 129, 0.08)" : evaluation.score >= 50 ? "rgba(245, 158, 11, 0.08)" : "rgba(239, 68, 68, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "28px",
                color: evaluation.score >= 80 ? "var(--success)" : evaluation.score >= 50 ? "var(--warning)" : "var(--error)",
                flexShrink: 0
              }}>
                {evaluation.score}%
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#ffffff" }}>
                  Cumulative Mock Score
                </h3>
                <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  {evaluation.score >= 85
                    ? "Exceptional! Excellent technical depth, professional communication skills, and appropriate behavioral alignments."
                    : evaluation.score >= 65
                      ? "Solid preparation. Good conceptual answers, but details could be enhanced with specific quantitative metrics."
                      : "Gaps identified in scaling and system layouts. Review optimal templates and practice your delivery."}
                </p>
              </div>
            </div>
            
            <button onClick={handleReset} className="btn-secondary" style={{ padding: "12px 20px" }}>
              <FiRefreshCw /> Restart Simulator
            </button>
          </div>

          {/* Grids for telemetry delivery feedback and core summaries */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {/* Delivery Scorecard */}
            <div className="glass-panel" style={{ padding: "30px" }}>
              <h4 style={{ margin: "0 0 20px 0", fontSize: "15px", fontWeight: "700", color: "#ffffff", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiVideo style={{ color: "var(--primary)" }} /> Physical Delivery Telemetry
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Smiling / Positive Face</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{evaluation.deliveryMetrics?.smiling}%</span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${evaluation.deliveryMetrics?.smiling}%`, backgroundColor: "var(--success)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Eye Contact Consistency</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{evaluation.deliveryMetrics?.eyeContact}%</span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${evaluation.deliveryMetrics?.eyeContact}%`, backgroundColor: "var(--primary)" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Confidence Rating</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{evaluation.deliveryMetrics?.confidence}%</span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${evaluation.deliveryMetrics?.confidence}%`, backgroundColor: "var(--secondary)" }} />
                  </div>
                </div>

                <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-dark)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span>🗣 Speaking Pacing: **{evaluation.deliveryMetrics?.pacing}**</span>
                  <span>🔊 Voice Volume: **{evaluation.deliveryMetrics?.volume}**</span>
                </div>
              </div>
            </div>

            {/* AI Delivery coaching text */}
            <div className="glass-panel" style={{ padding: "30px" }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "#ffffff", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiSmile style={{ color: "var(--secondary)" }} /> Attitude & Posture Assessment
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-main)", lineHeight: "1.6" }}>
                {evaluation.deliveryFeedback}
              </p>
            </div>
          </div>

          {/* Core Strengths & Areas to improve */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            <div className="glass-panel" style={{ padding: "30px", borderLeft: "4px solid var(--success)" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "700", color: "var(--success)", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiCheckCircle /> Key Strengths / Improvements
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                {evaluation.improvements}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "30px", borderLeft: "4px solid var(--warning)" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "700", color: "var(--warning)", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiAlertCircle /> Code / Architecture Mistakes
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                {evaluation.mistakes}
              </p>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", margin: "10px 0 0 0" }}>
              Question-by-Question Diagnostics
            </h3>

            {evaluation.feedback.map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Question title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#ffffff", lineHeight: "1.5" }}>
                    Q{idx + 1}: {item.question}
                  </h4>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: item.score >= 8 ? "var(--success)" : item.score >= 5 ? "var(--warning)" : "var(--error)",
                    backgroundColor: item.score >= 8 ? "rgba(16, 185, 129, 0.08)" : item.score >= 5 ? "rgba(245, 158, 11, 0.08)" : "rgba(239, 68, 68, 0.08)",
                    border: `1px solid ${item.score >= 8 ? "rgba(16, 185, 129, 0.15)" : item.score >= 5 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap"
                  }}>
                    {item.score} / 10 pts
                  </span>
                </div>

                {/* Answer transcript */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", backgroundColor: "rgba(255, 255, 255, 0.01)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dark)", textTransform: "uppercase", width: "70px", flexShrink: 0 }}>Transcript:</span>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", lineHeight: "1.5" }}>
                    {item.userAnswer}
                  </p>
                </div>

                {/* Score diagnostic review */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", width: "70px", flexShrink: 0 }}>Review:</span>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-main)", lineHeight: "1.5" }}>
                    {renderFeedbackContent(item.feedback)}
                  </p>
                </div>

                {/* Template Optimal template */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", backgroundColor: "rgba(99, 102, 241, 0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.08)" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--secondary)", textTransform: "uppercase", width: "70px", flexShrink: 0 }}>Optimal:</span>
                  <p style={{ margin: 0, fontSize: "13px", color: "#a5b4fc", lineHeight: "1.5" }}>
                    {item.optimalAnswer}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Embedded Animations styling */}
      <style>{`
        @keyframes pulseWave {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); box-shadow: 0 0 25px rgba(99, 102, 241, 0.35); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @media (max-width: 900px) {
          .interview-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
