const path = require("path");

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  databaseUrl: process.env.DATABASE_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  uploadsDir: process.env.UPLOADS_DIR || "uploads",
  uploadsPath: path.resolve(process.cwd(), process.env.UPLOADS_DIR || "uploads"),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

module.exports = { config };
