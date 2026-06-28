require("dotenv").config();
console.log("JWT_SECRET =", process.env.JWT_SECRET);

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const profileRoutes =require("./routes/profileRoutes");
const jobsRoutes =require("./routes/jobsRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const interviewRoutes = require("./routes/interviewRoutes");





const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/profile", resumeRoutes);

app.use(
  "/api/jobs",
  jobsRoutes
);


app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/chatbot",
  chatbotRoutes
);

app.use(
  "/api/interview",
  interviewRoutes
);

app.use(
  express.static(
    path.join(__dirname, "../frontend-react/dist")
  )
);

app.get("/", (_req, res) => {
  res.json({
    message: "CareerLens Backend API Running"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});