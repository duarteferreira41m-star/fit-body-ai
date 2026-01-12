require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
const { config } = require("./config");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { workoutsRouter } = require("./routes/workouts");
const { dietRouter } = require("./routes/diet");
const { measurementsRouter } = require("./routes/measurements");
const { photosRouter } = require("./routes/photos");
const { exercisesRouter } = require("./routes/exercises");
const { analysisRouter } = require("./routes/analysis");
const { plansRouter } = require("./routes/plans");
const { chatRouter } = require("./routes/chat");

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(passport.initialize());

app.use("/uploads", express.static(path.resolve(process.cwd(), config.uploadsDir)));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/workouts", workoutsRouter);
app.use("/api/diet", dietRouter);
app.use("/api/measurements", measurementsRouter);
app.use("/api/photos", photosRouter);
app.use("/api/exercises", exercisesRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/plans", plansRouter);
app.use("/api/chat", chatRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});
