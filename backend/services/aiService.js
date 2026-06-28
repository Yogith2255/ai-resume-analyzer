const axios = require("axios");

async function generateCoachResponse({ message, userSkills = [], currentJobs = [], chatHistory = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // If Gemini API Key exists, use it!
  if (apiKey) {
    try {
      const systemInstruction = `You are CareerLens AI Coach, an expert technical career advisor.
You help software developers, data scientists, and ML engineers optimize their resumes, fill skill gaps, choose projects, and prepare for interviews.
The user has the following skills: ${userSkills.join(", ") || "None listed yet. Encourage them to upload a resume"}.
The user is currently matched with these jobs: ${JSON.stringify(currentJobs.slice(0, 3).map(j => ({ title: j.title, company: j.company, missingSkills: j.missingSkills })))}.

Provide actionable, brief, encouraging career advice. Highlight which skills the user needs to acquire. Offer specific project ideas (e.g. build a Docker container for a Node app, implement FAISS for search, etc.) to bridge gaps.
Format code snippets and keywords cleanly in markdown. Maintain a professional, friendly, and expert developer tone. Keep replies under 3 paragraphs.`;

      const contents = [];

      // Map chat history to Gemini API format
      chatHistory.forEach(item => {
        contents.push({
          role: item.sender === "user" ? "user" : "model",
          parts: [{ text: item.text }]
        });
      });

      // Add the new message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (error) {
      console.error("Gemini API Error:", error.message || error);
      // Fallback to local intelligence if API call fails
    }
  }

  // Fallback Rule Engine (Local Intelligent Coach)
  const lowerMsg = message.toLowerCase();

  // Extract missing skills across matching jobs to give advice
  const allMissingSkills = new Set();
  currentJobs.forEach(job => {
    if (job.missingSkills) {
      job.missingSkills.forEach(skill => allMissingSkills.add(skill));
    }
  });
  const missingArr = Array.from(allMissingSkills).slice(0, 5);

  if (lowerMsg.includes("project") || lowerMsg.includes("build") || lowerMsg.includes("learn")) {
    if (missingArr.length > 0) {
      const topSkill = missingArr[0];
      return `Based on your matching jobs, you are missing **${topSkill}**. Here is a practical project you can build to add it to your profile:
      
1. **Build a Microservice Web App**: Implement a simple CRUD backend using Node.js/Express or Python/FastAPI.
2. **Integrate ${topSkill}**: Build a key feature utilizing this technology. For example, if it's Docker, write a multi-stage Dockerfile and compile it; if it's SQL/PostgreSQL, implement database migrations, indices, and complex joins; if it's React, build a responsive dashboard with state management.
3. **Deploy & Document**: Push it to GitHub with a clean README containing architectural diagrams.

Would you like advice on preparing a resume bullet point for this project?`;
    }

    return `Here is a great project idea to level up your resume:
    
*   **AI Search Assistant (RAG Engine)**: Create a React frontend and Express backend. Use a vector database like FAISS/SQLite to store embeddings and hook it up to Gemini AI to search over PDF documents.
*   **Key skills highlighted**: React, Node.js, REST APIs, Databases, AI integration, Git.

This is highly valued by modern engineering teams! What specific area of web or backend development are you looking to practice next?`;
  }

  if (lowerMsg.includes("gap") || lowerMsg.includes("missing") || lowerMsg.includes("skills") || lowerMsg.includes("ats")) {
    if (missingArr.length > 0) {
      return `Looking at the jobs you match with, here are the key skill gaps preventing you from scoring higher:

*   **Key Missing Skills**: ${missingArr.map(s => `\`${s}\``).join(", ")}.
*   **Recommendation**: Focus on learning ${missingArr[0]} first, as it appears in multiple job descriptions. You can build a small practice app to get hands-on experience quickly.

Would you like me to suggest a specific project tutorial or resource for any of these skills?`;
    }
    return `You have a very strong alignment with the currently matching job listings! Your core skills (${userSkills.slice(0, 6).join(", ")}) match well. 

To improve your chances further, consider adding cloud skills (like **AWS** or **GCP**) or containerization tools (like **Docker**), which are standard across modern developer job specifications.`;
  }

  if (lowerMsg.includes("resume") || lowerMsg.includes("ats score") || lowerMsg.includes("improve")) {
    return `To optimize your resume and get a higher ATS score for engineering roles:

1.  **Use Action Verbs**: Start your project bullet points with active words (e.g., *"Architected node service...", "Optimized SQL queries reducing latency by 30%..."*).
2.  **Add Tech Headers**: Under each project and experience listed, explicitly state the technologies used: \`React, Node.js, SQLite, Git\`.
3.  **Align Keywords**: Ensure terms match casing (e.g., use "TypeScript" instead of "typescript").

If you upload a new resume on the **Profile** page, I will instantly re-parse it and update your job match dashboard!`;
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
    return `Hello! I am your **CareerLens AI Coach**. 

I have analyzed your profile. You have ${userSkills.length || 0} skills registered. 
${missingArr.length > 0 ? `I noticed you have a few skill gaps (like **${missingArr.slice(0, 2).join(" & ")}**) for the top-matched jobs.` : "You have a solid set of matches!"}

How can I help you today? You can ask:
*   *"What projects can I build to learn new skills?"*
*   *"What are my biggest skill gaps?"*
*   *"How can I improve my resume's ATS score?"*`;
  }

  // General default fallback
  return `That's an interesting question! To make your career pivot successful:
  
*   **Focus on Gaps**: Work on adding missing skills like ${missingArr.length > 0 ? missingArr.slice(0, 3).map(s => `\`${s}\``).join(", ") : "`Docker`, `AWS`, or `TypeScript`"}.
*   **Hands-on building**: The best way to impress recruiters is with running, deployed code.
*   **Keep Resume Updated**: Make sure these skills are explicitly mentioned in your uploaded resume document.
 
What is the biggest roadblock you are facing in your job search right now?`;
}

async function generateJDCoachingResponse({ userSkills = [], jdSkills = [], matchedSkills = [], missingSkills = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const systemInstruction = `You are CareerLens AI Coach, an expert technical career advisor.
Analyse the parsed job description requirements and the user's matching profile.
The user has the following skills: ${userSkills.join(", ") || "None listed yet. Encourage them to upload a resume or add skills manually"}.
The job description requires the following skills: ${jdSkills.join(", ") || "None extracted"}.
Matched skills: ${matchedSkills.join(", ") || "None"}.
Missing skills: ${missingSkills.join(", ") || "None"}.

Provide actionable, encouraging advice on how the user can align their resume for this job. For the missing skills, suggest specific, concrete project ideas (e.g. build a Docker container for a Node app, implement FAISS for search, etc.) to bridge the gaps. Highlight how they should write resume bullet points.
Format code snippets and keywords cleanly in markdown. Keep replies under 3 paragraphs.`;

      const contents = [
        {
          role: "user",
          parts: [{ text: "Please generate the job description alignment advice." }]
        }
      ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (error) {
      console.error("Gemini JD API Error:", error.message || error);
    }
  }

  // Fallback Rule Engine
  if (missingSkills.length === 0) {
    return `### 🎉 Perfect Match!
You match 100% of the required skills for this job description! 

**Next Steps**:
1. Make sure to **bold** these key terms in your resume: ${matchedSkills.map(s => `\`${s}\``).join(", ")}.
2. Apply immediately and tailor your cover letter highlighting your experience with these technologies.`;
  }

  const suggestions = missingSkills.map((skill, index) => {
    if (index > 2) return "";
    return `*   **${skill}**: Build a small project implementing it. For example, create a mini repository on GitHub demonstrating your setup, add unit tests, and write a clear documentation README.`;
  }).filter(Boolean).join("\n");

  return `### 📊 Resume Gap Analysis
You match **${matchedSkills.length}** out of **${jdSkills.length}** identified requirements for this role.

#### Actionable Recommendations to Bridge Gaps:
${suggestions}

#### Resume Bullet point suggestion:
*   *\"Integrated ${matchedSkills[0] || "core services"} and researched ${missingSkills[0]} implementation, improving team productivity and learning curve by building localized test setups.\"*`;
}

async function generateInterviewQuestions({ userSkills = [], jdText = "" }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const systemInstruction = `You are CareerLens AI Interviewer.
Based on the following job description, generate exactly 10 technical and behavioral interview questions tailored for a candidate with these skills: ${userSkills.join(", ") || "None listed yet"}.
Job Description: ${jdText}.

The questions MUST progress in difficulty and standard sequentially:
- Questions 1-2: Easy (Introduction, basic concepts and icebreakers related to the job)
- Questions 3-5: Medium (Practical implementations, framework details, and system design basics)
- Questions 6-8: Hard (Scale, optimization, security, and debugging complex production bottlenecks)
- Questions 9-10: Behavioral (Team dynamics, conflict resolution, trade-off alignment using the STAR method)

Return ONLY a valid JSON array of strings containing exactly 10 questions. Do not include markdown code block syntax (like \`\`\`json), explanations, comments, or any extra characters.
Example Output format:
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Question 6", "Question 7", "Question 8", "Question 9", "Question 10"]`;

      const contents = [{ role: "user", parts: [{ text: "Generate the questions." }] }];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { maxOutputTokens: 1000, temperature: 0.5 }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanedText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedText);
      }
    } catch (error) {
      console.error("Gemini Interview Questions API Error:", error.message || error);
    }
  }

  // Fallback Rule Engine
  const extractedSkills = require("../utils/extractSkills")(jdText);
  const matched = extractedSkills.slice(0, 5);
  
  return [
    `Could you introduce yourself and tell me what interests you about this role focusing on ${matched[0] || "software development"}?`,
    `What are the core differences between a relational and non-relational database, and when would you use one over the other?`,
    `How do you manage client-side state and component re-renders when building interfaces with ${matched[1] || "React"}?`,
    `Can you walk me through the lifecycle of an HTTP request from the browser until it hits a service running on ${matched[2] || "Node.js"}?`,
    `How do you implement proper authentication and token validation (e.g. JWT) in a modern web application backend?`,
    `Explain how you would configure a multi-stage build in Docker for a production deployment of ${matched[0] || "your service"}, and how you would optimize image size.`,
    `Suppose database queries on ${matched[3] || "your DB layer"} start slowing down under high traffic. What specific profiling tools and indexing strategies would you use to resolve it?`,
    `How would you design a secure, distributed caching layer (like Redis) to handle rate limiting or session persistence across multiple microservice instances?`,
    `Describe a time when you disagreed with a senior engineer or product manager on a technical decision. How did you resolve it and what trade-offs were made?`,
    `Can you describe a situation where you had a production outage or critical bug in a system you built? Walk me through how you handled the situation under pressure.`
  ];
}

async function evaluateInterviewAnswers({ questions = [], answers = [], userSkills = [], deliveryMetrics = null }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const qnaList = questions.map((q, i) => ({
        question: q,
        answer: answers[i] || "No answer provided."
      }));

      const deliveryContext = deliveryMetrics ? `
The candidate was also monitored via camera and audio during the interview. Here are their communication delivery metrics:
- Eye Contact Quality: ${deliveryMetrics.eyeContact}%
- Positive Face / Smiling Frequency: ${deliveryMetrics.smiling}%
- General Posture/Confidence: ${deliveryMetrics.confidence}%
- Speaking Pacing (speed): ${deliveryMetrics.pacing || "Normal"}
- Speaking Volume Stability: ${deliveryMetrics.volume || "Good"}
Please incorporate these delivery aspects into a new "deliveryFeedback" section in your evaluation, providing professional tips on their posture, facial expression, and verbal confidence.
` : "";

      const systemInstruction = `You are CareerLens AI Interview Grader.
Evaluate the candidate's answers to the technical/behavioral interview questions.
Questions & Answers: ${JSON.stringify(qnaList)}.
Candidate's profile skills: ${userSkills.join(", ")}.${deliveryContext}

Calculate an overall score out of 100 based on their tech depth, clarity, and delivery.
For each question, compute a score out of 10, write a short constructive review feedback (2-3 sentences), and write a sample optimal answer that shows high expertise.
Also include a summary of overall "improvements", "mistakes", and "deliveryFeedback" (focused on body language, eye contact, and attitude/smiling from the camera data).

Return ONLY a valid JSON object in this format (no markdown blocks like \`\`\`json, no preamble):
{
  "score": 75,
  "improvements": "Summary of overall improvements...",
  "mistakes": "Summary of common mistakes/gaps...",
  "deliveryFeedback": "Professional coaching on attitude, smiling, eye contact, and posture...",
  "feedback": [
    {
      "question": "Question text",
      "userAnswer": "Candidate's answer",
      "score": 8,
      "feedback": "Your review comments",
      "optimalAnswer": "Expert answer suggestion"
    }
  ]
}`;

      const contents = [{ role: "user", parts: [{ text: "Evaluate the answers." }] }];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { maxOutputTokens: 2000, temperature: 0.3 }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanedText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedText);
      }
    } catch (error) {
      console.error("Gemini Interview Evaluation API Error:", error.message || error);
    }
  }

  // Fallback Rule Engine
  const feedbackList = questions.map((question, i) => {
    const ans = answers[i] || "";
    const wordCount = ans.split(/\s+/).filter(Boolean).length;
    let score = 5;
    let review = "Your response is a bit short. Try expanding with specific STAR-method examples (Situation, Task, Action, Result) and mention tools used.";
    
    if (wordCount > 30) {
      score = 9;
      review = "Good detail and technical context. You effectively explained your approach and methodology.";
    } else if (wordCount > 10) {
      score = 7;
      review = "Decent start, but could benefit from explaining how you measured the outcome or resolved trade-offs.";
    }
    
    return {
      question,
      userAnswer: ans || "(No answer)",
      score,
      feedback: review,
      optimalAnswer: `[Optimal Example] When addressing this, start by describing the specific scenario. Explain your exact implementation steps, detail how the technologies (e.g. React hooks, Express middlewares, Docker containers) solved the core bottleneck, and cite measurable results like 20% reduction in query times or 100% deployment coverage.`
    };
  });

  const rawScore = feedbackList.reduce((acc, f) => acc + f.score, 0);
  const maxScore = questions.length * 10;
  const percentageScore = Math.round((rawScore / maxScore) * 100);

  const finalDeliveryFeedback = deliveryMetrics ? 
    `Your eye contact was rated at ${deliveryMetrics.eyeContact}%. Remember to look directly at the camera to establish confidence. Your smile frequency score was ${deliveryMetrics.smiling}%. Maintaining a warm, slight smile during the intro and behavioral answers significantly increases trust. Your posture confidence rating is ${deliveryMetrics.confidence}%, showing a strong executive presence.` : 
    "No delivery telemetry was captured. Keep a warm, positive attitude, smile when appropriate, sit upright, and look directly at the lens to convey professionalism during virtual interviews.";

  return {
    score: percentageScore,
    improvements: "Structure your answers using the STAR method. Focus on providing quantitative results (e.g. reduced build time by 40%, improved database query speed by 2x) rather than generic explanations.",
    mistakes: "Some answers lack detailed implementation steps, leaving ambiguity regarding how you specifically resolved code or scaling bottlenecks.",
    deliveryFeedback: finalDeliveryFeedback,
    feedback: feedbackList
  };
}

async function generateInterviewChatResponse({ jdText = "", chatHistory = [], userSkills = [], turnCount = 0 }) {
  const apiKey = process.env.GEMINI_API_KEY;

  const candidateMessages = chatHistory.filter(msg => msg.role === "candidate" || msg.role === "user");
  const interviewerMessages = chatHistory.filter(msg => msg.role === "interviewer" || msg.role === "model");

  const lastCandidateMsg = candidateMessages[candidateMessages.length - 1]?.text || "";
  const lastCandidateMsgLower = lastCandidateMsg.toLowerCase().trim();
  const lastInterviewerQuestion = interviewerMessages[interviewerMessages.length - 1]?.text || "";

  // 1. Meta Query Check (Audio, Repeat, Hold)
  if (lastCandidateMsgLower) {
    if (lastCandidateMsgLower.includes("audio clear") || 
        lastCandidateMsgLower.includes("hear me") || 
        lastCandidateMsgLower.includes("mic working") || 
        lastCandidateMsgLower.includes("mic check") ||
        lastCandidateMsgLower.includes("sound clear") ||
        lastCandidateMsgLower.includes("is my audio working") ||
        lastCandidateMsgLower.includes("is my sound working")) {
      return {
        reply: "Yes, I can hear you perfectly clear! Your microphone level is stable. Please proceed with your answer to the last question.",
        shouldAdvanceTurn: false
      };
    }

    if (lastCandidateMsgLower.includes("repeat") || 
        lastCandidateMsgLower.includes("say that again") || 
        lastCandidateMsgLower.includes("pardon") || 
        lastCandidateMsgLower.includes("what was the question") ||
        lastCandidateMsgLower.includes("repeat the question") ||
        lastCandidateMsgLower.includes("could you repeat") ||
        lastCandidateMsgLower.includes("say it again")) {
      return {
        reply: `Certainly, let me repeat the question: "${lastInterviewerQuestion || "Could you introduce yourself and tell me what interests you about this role?"}"`,
        shouldAdvanceTurn: false
      };
    }

    if (lastCandidateMsgLower.includes("give me a second") || 
        lastCandidateMsgLower.includes("wait a moment") || 
        lastCandidateMsgLower.includes("hold on") ||
        lastCandidateMsgLower.includes("give me a moment") ||
        lastCandidateMsgLower.includes("one second") ||
        lastCandidateMsgLower.includes("wait a second")) {
      return {
        reply: "No problem at all, take your time. I am listening here whenever you are ready.",
        shouldAdvanceTurn: false
      };
    }
  }

  // 2. Gemini conversational flow
  if (apiKey) {
    try {
      const systemInstruction = `You are CareerLens AI Interviewer, conducting a live, conversational, face-to-face mock interview.
The target job description is: ${jdText}.
The candidate's skills are: ${userSkills.join(", ") || "None listed yet"}.

Currently, we are at turn #${turnCount} of the interview (maximum of 8-10 turns).
Review the candidate's last reply:
1. If the candidate's reply is completely off-topic, gibberish, blank, or doesn't attempt to address the question asked at all:
   - Set "shouldAdvanceTurn" to false.
   - Politely explain that their response is unrelated to the question, and prompt them to answer again.
2. Otherwise (valid answer attempt, even if short):
   - Keep your response brief (1-2 sentences).
   - Respond naturally to their answer (e.g. validate or comment on their technical point).
   - Ask the next progressive difficulty question tailored to the role.
   - Set "shouldAdvanceTurn" to true.
   
Return ONLY a valid JSON object in this format (no markdown blocks like \`\`\`json, no text outside it):
{
  "reply": "Your interviewer response text",
  "shouldAdvanceTurn": true
}`;

      // Map chat history to Gemini format
      const contents = chatHistory.map(msg => ({
        role: msg.role === "interviewer" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

      if (contents.length === 0) {
        contents.push({ role: "user", parts: [{ text: "Hello, let's start the interview." }] });
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { 
          maxOutputTokens: 300, 
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        try {
          const parsed = JSON.parse(text.trim());
          if (parsed.reply) {
            return {
              reply: parsed.reply,
              shouldAdvanceTurn: parsed.shouldAdvanceTurn ?? true
            };
          }
        } catch (e) {
          console.warn("Gemini didn't return valid JSON:", text);
          const cleanedText = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          return {
            reply: parsed.reply,
            shouldAdvanceTurn: parsed.shouldAdvanceTurn ?? true
          };
        }
      }
    } catch (error) {
      console.error("Gemini Interview Chat API Error:", error.message || error);
    }
  }

  // Fallback Rule Engine with relevance validation
  const lowerJd = jdText.toLowerCase();
  const extractedSkills = require("../utils/extractSkills")(jdText);
  const matched = extractedSkills.length > 0 ? extractedSkills : ["software development", "React", "Node.js", "databases", "system design"];
  let fallbackQuestions = [];

  if (lowerJd.includes("react") || lowerJd.includes("frontend") || lowerJd.includes("ui") || lowerJd.includes("css") || lowerJd.includes("angular") || lowerJd.includes("vue") || lowerJd.includes("web designer") || lowerJd.includes("design") || lowerJd.includes("html")) {
    fallbackQuestions = [
      `Hello! Welcome to CareerLens Mock Interview. Let's start with a warm introduction. Could you introduce yourself and tell me what interests you about this Frontend Developer role focusing on ${matched[0] || "frontend development"}?`,
      `Great to meet you. Let's start with styling and layout: How do you structure your CSS components when working with ${matched[1] || "React"} and layout systems like Flexbox or Grid?`,
      `Good. Pertaining to React, how do you handle client-side state management, and what strategies do you employ to prevent unnecessary component re-renders when working with ${matched[0] || "JavaScript"}?`,
      `Interesting strategies. How does browser code splitting or lazy loading improve frontend performance, and how do you implement it for resources like ${matched[2] || "assets/packages"}?`,
      `Performance is key. Can you explain how the Virtual DOM works and why 'key' props are necessary when rendering dynamic lists in ${matched[1] || "React"}?`,
      `Good details. Let's touch security: How do you protect frontend applications against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) when dealing with API endpoints?`,
      `Security is very important. Can you describe how you configure bundlers (like ${matched[3] || "Vite/Webpack"}) to optimize final bundle sizes for production?`,
      `Excellent. Describe a time you disagreed with a UI designer or PM regarding a visual layout or tech choice. How did you align on a decision?`,
      `Collaboration is vital. Finally, if a critical bug crashes the frontend in production, what is your diagnostic checklist to trace and resolve it?`
    ];
  } else if (lowerJd.includes("machine learning") || lowerJd.includes("ml") || lowerJd.includes("data science") || lowerJd.includes("ai") || lowerJd.includes("artificial intelligence") || lowerJd.includes("python") || lowerJd.includes("deep learning") || lowerJd.includes("nlp") || lowerJd.includes("vision") || lowerJd.includes("analyst") || lowerJd.includes("analytics")) {
    fallbackQuestions = [
      `Hello! Welcome to CareerLens Mock Interview. Let's start with a warm introduction. Could you introduce yourself and tell me what interests you about this Machine Learning and Data Science role focusing on ${matched[0] || "AI/ML tools"}?`,
      `Nice to meet you. Let's start with model training: Explain the difference between overfitting and underfitting, and what regularization methods you use to mitigate overfitting when working with ${matched[1] || "training data"}?`,
      `Understood. Let's talk deep learning architectures: What is the core difference between a Convolutional Neural Network (CNN) and a Transformer model, and when would you use each in a project using ${matched[2] || "Python"}?`,
      `Transformer architectures are indeed powerful. Can you describe your feature engineering process and how you handle missing values or high-dimensionality in training data?`,
      `Good. Let's touch on optimization: How do gradient descent variations (like Adam) work, and how do you resolve vanishing or exploding gradient bottlenecks in ${matched[3] || "ML frameworks"}?`,
      `Good detail. How would you design a production inferencing pipeline to deploy models securely with low latency (e.g. using ${matched[4] || "FastAPI"} and containerization)?`,
      `Operationalization is key. Describe the differences between supervised, unsupervised, and reinforcement learning, giving a practical use case for each.`,
      `Nice examples. Describe a time when you had to explain a complex ML model's prediction or metric to a non-technical stakeholder. How did you communicate it?`,
      `Excellent stakeholder management. Finally, how do you continuously monitor model performance and handle data drift once a model is live in production?`
    ];
  } else if (lowerJd.includes("devops") || lowerJd.includes("qa") || lowerJd.includes("test") || lowerJd.includes("sdet") || lowerJd.includes("kubernetes") || lowerJd.includes("docker") || lowerJd.includes("aws") || lowerJd.includes("azure") || lowerJd.includes("cloud") || lowerJd.includes("sre")) {
    fallbackQuestions = [
      `Hello! Welcome to CareerLens Mock Interview. Let's start with a warm introduction. Could you introduce yourself and tell me what interests you about this DevOps / QA Testing role focusing on ${matched[0] || "cloud operations"}?`,
      `Great to meet you. Let's start with CI/CD: How do you build an optimized, secure build pipeline using tools like ${matched[1] || "GitHub Actions"}?`,
      `Pipeline speed is crucial. What is the difference between a multi-stage Docker build and a single-stage build, and how does it optimize final artifact sizes for ${matched[2] || "containers"}?`,
      `Docker efficiency is indeed key. How does orchestration (like ${matched[3] || "Kubernetes/ECS"}) manage service discovery and load balancing between running pods?`,
      `Good cluster details. What is Infrastructure as Code (IaC), and when do you choose tools like ${matched[4] || "Terraform"} over configuration management tools like Ansible?`,
      `Excellent. Pertaining to quality assurance: What automated testing frameworks do you write (e.g. Selenium, Cypress, PyTest) and how do you trigger them in deployment?`,
      `Testing coverage is essential. Let's talk metrics: How do you set up monitoring, logging, and alerts to identify anomalies?`,
      `Good observability. Describe a time when you disagreed with a developer on whether a bug should block a production release. How did you resolve it?`,
      `A typical alignment challenge. Finally, walk me through your incident response protocol if a cluster node fails and triggers a production outage.`
    ];
  } else if (lowerJd.includes("product manager") || lowerJd.includes("project manager") || lowerJd.includes("scrum") || lowerJd.includes("agile") || lowerJd.includes("pmo") || lowerJd.includes("management") || lowerJd.includes("owner")) {
    fallbackQuestions = [
      `Hello! Welcome to CareerLens Mock Interview. Let's start with a warm introduction. Could you introduce yourself and tell me what interests you about this Management role focusing on ${matched[0] || "product delivery"}?`,
      `Great to meet you. In product development, how do you balance technical debt against the delivery of new customer-facing features, especially when utilizing frameworks like ${matched[1] || "Agile/Scrum"}?`,
      `How do you define, track, and measure project success? What key metrics do you focus on when managing pipelines involving ${matched[2] || "software releases"}?`,
      `When requirements change midway through a development sprint, how do you manage stakeholder expectations while keeping the engineering team focused and motivated?`,
      `Can you describe your methodology for backlog prioritization? How do you use frameworks like MoSCoW or RICE to prioritize features involving ${matched[3] || "complex integrations"}?`,
      `Collaboration is essential: How do you foster cross-functional alignment between engineering, design, marketing, and business stakeholders during a major launch?`,
      `Describe a scenario where a project was falling behind its scheduled deadline. What steps did you take to manage the risk and recover the timeline?`,
      `Describe a time when you had a severe conflict within your team or with a client on a product decision. How did you handle the situation to achieve a constructive outcome?`,
      `Finally, how do you handle post-launch feedback? Walk me through how you conduct post-mortems or retrospectives to ensure continuous iteration.`
    ];
  } else {
    fallbackQuestions = [
      `Hello! Welcome to CareerLens Mock Interview. Let's start with a warm introduction. Could you introduce yourself and tell me what interests you about this Developer role focusing on ${matched[0] || "software development"}?`,
      `Thanks for that introduction. Let's move to database layouts. What are the core differences between a relational and non-relational database, and when would you use ${matched[3] || "SQL/NoSQL"} databases?`,
      `Relational vs non-relational databases are indeed a key choice. Let's talk scale: How do you manage client sessions, API rate limiting, and distributed state in a multi-server architecture utilizing ${matched[1] || "caching tools"}?`,
      `Good state management. Can you walk me through the lifecycle of an HTTP request from the moment a user hits Enter in the browser until the backend running ${matched[2] || "Node.js/Python"} responds?`,
      `Excellent tracing. How do you implement secure JWT token authentication and session validation in a backend service?`,
      `Security is crucial. Let's scale up: How do you profile backend queries and implement database indexes to speed up slower execution paths under heavy loads?`,
      `Good indexing. How would you design a distributed rate limiter and cache layer using ${matched[4] || "Redis"} to protect your APIs?`,
      `Rate limiting is essential. Describe a situation where you disagreed with a senior engineer on an architectural design. How did you reach a consensus?`,
      `Great negotiation. Finally, can you walk me through a time when you had a production database crash or server outage? How did you diagnose and restore the service?`
    ];
  }

  if (turnCount === 0) {
    return {
      reply: fallbackQuestions[0],
      shouldAdvanceTurn: true
    };
  }

  if (turnCount >= fallbackQuestions.length) {
    return {
      reply: `Thank you! That concludes our conversational mock interview. I have captured your audio transcripts and webcam posture logs. Please click 'Finish Interview' to review your detailed performance scorecard.`,
      shouldAdvanceTurn: true
    };
  }

  // 3. Fallback Relevance check
  const wordCount = lastCandidateMsg.split(/\s+/).filter(Boolean).length;
  const isSkip = lastCandidateMsgLower.includes("don't know") || 
                 lastCandidateMsgLower.includes("skip") || 
                 lastCandidateMsgLower.includes("no idea") ||
                 lastCandidateMsgLower.includes("pass") ||
                 lastCandidateMsgLower.includes("next question");
                 
  if (wordCount > 0 && wordCount < 3 && !isSkip) {
    return {
      reply: `It looks like your response is a bit short or off-topic. Could you please share a bit more detail to address the last question?`,
      shouldAdvanceTurn: false
    };
  }

  // Generate a brief transition reply + follow up
  let transition = "That makes sense.";
  if (wordCount > 15) {
    transition = "Thank you for the detailed answer, that highlights key concepts.";
  } else if (wordCount === 0) {
    transition = "Let's move on.";
  }
  
  return {
    reply: `${transition} Let's progress further: ${fallbackQuestions[turnCount] || fallbackQuestions[fallbackQuestions.length - 1]}`,
    shouldAdvanceTurn: true
  };
}

async function evaluateInterviewChat({ chatHistory = [], userSkills = [], deliveryMetrics = null }) {
  const apiKey = process.env.GEMINI_API_KEY;

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

  if (apiKey) {
    try {
      const deliveryContext = deliveryMetrics ? `
The candidate was monitored via camera and audio. Here are their communication delivery metrics:
- Eye Contact Quality: ${deliveryMetrics.eyeContact}%
- Positive Face / Smiling Frequency: ${deliveryMetrics.smiling}%
- General Posture/Confidence: ${deliveryMetrics.confidence}%
- Speaking Pacing (speed): ${deliveryMetrics.pacing || "Normal"}
- Speaking Volume Stability: ${deliveryMetrics.volume || "Good"}
Please incorporate these delivery aspects into a new "deliveryFeedback" section in your evaluation, providing professional tips on their posture, facial expression, and verbal confidence.
` : "";

      const systemInstruction = `You are CareerLens AI Interview Grader.
Evaluate the candidate's answers based on the conversational mock interview transcript.
Conversational Exchange List: ${JSON.stringify(qnaList)}.
Candidate's profile skills: ${userSkills.join(", ")}.${deliveryContext}

Calculate an overall score out of 100 based on their tech depth, clarity, and delivery.
For each conversational question, compute a score out of 10, write a short constructive review feedback (2-3 sentences), and write a sample optimal answer that shows high expertise.
Also include a summary of overall "improvements", "mistakes", and "deliveryFeedback" (focused on body language, eye contact, and attitude/smiling from the camera data).

Return ONLY a valid JSON object in this format (no markdown blocks like \`\`\`json, no preamble):
{
  "score": 75,
  "improvements": "Summary of overall improvements...",
  "mistakes": "Summary of common mistakes/gaps...",
  "deliveryFeedback": "Professional coaching on attitude, smiling, eye contact, and posture...",
  "feedback": [
    {
      "question": "Question text",
      "userAnswer": "Candidate's answer",
      "score": 8,
      "feedback": "Your review comments",
      "optimalAnswer": "Expert answer suggestion"
    }
  ]
}`;

      const contents = [{ role: "user", parts: [{ text: "Evaluate the conversational transcripts." }] }];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { maxOutputTokens: 2000, temperature: 0.3 }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanedText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedText);
      }
    } catch (error) {
      console.error("Gemini Interview Chat Evaluation API Error:", error.message || error);
    }
  }

  // Fallback Rule Engine
  const feedbackList = qnaList.map((item, i) => {
    const ans = item.answer || "";
    const wordCount = ans.split(/\s+/).filter(Boolean).length;
    let score = 5;
    let review = "Your response is a bit short. Try expanding with specific STAR-method examples (Situation, Task, Action, Result) and mention tools used.";
    
    if (wordCount > 30) {
      score = 9;
      review = "Good detail and technical context. You effectively explained your approach and methodology.";
    } else if (wordCount > 10) {
      score = 7;
      review = "Decent start, but could benefit from explaining how you measured the outcome or resolved trade-offs.";
    }
    
    return {
      question: item.question,
      userAnswer: ans || "(No answer)",
      score,
      feedback: review,
      optimalAnswer: `[Optimal Example] When addressing this, start by describing the specific scenario. Explain your exact implementation steps, detail how the technologies (e.g. React hooks, Express middlewares, Docker containers) solved the core bottleneck, and cite measurable results like 20% reduction in query times or 100% deployment coverage.`
    };
  });

  const rawScore = feedbackList.reduce((acc, f) => acc + f.score, 0);
  const maxScore = feedbackList.length * 10 || 10;
  const percentageScore = Math.round((rawScore / maxScore) * 100);

  const finalDeliveryFeedback = deliveryMetrics ? 
    `Your eye contact was rated at ${deliveryMetrics.eyeContact}%. Remember to look directly at the camera to establish confidence. Your smile frequency score was ${deliveryMetrics.smiling}%. Maintaining a warm, slight smile during the intro and behavioral answers significantly increases trust. Your posture confidence rating is ${deliveryMetrics.confidence}%, showing a strong executive presence.` : 
    "No delivery telemetry was captured. Keep a warm, positive attitude, smile when appropriate, sit upright, and look directly at the lens to convey professionalism during virtual interviews.";

  return {
    score: percentageScore,
    improvements: "Structure your answers using the STAR method. Focus on providing quantitative results (e.g. reduced build time by 40%, improved database query speed by 2x) rather than generic explanations.",
    mistakes: "Some answers lack detailed implementation steps, leaving ambiguity regarding how you specifically resolved code or scaling bottlenecks.",
    deliveryFeedback: finalDeliveryFeedback,
    feedback: feedbackList
  };
}

module.exports = {
  generateCoachResponse,
  generateJDCoachingResponse,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  generateInterviewChatResponse,
  evaluateInterviewChat
};
