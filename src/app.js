import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import assessmentRouter from "./routes/assessment.routes.js";
import reportRouter from "./routes/report.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Dev logger
app.use((req, res, next) => {
  console.log("--- New Request Received ---");
  console.log("URL:", req.originalUrl);
  console.log("METHOD:", req.method);
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);
  console.log("--------------------------");
  next();
});

// Mount routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/assessment", assessmentRouter); // POST /api/v1/assessment/start
app.use("/api/v1/report", reportRouter);

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// 404 JSON (helps avoid HTML "Cannot POST ..." page)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

export { app };