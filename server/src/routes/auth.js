const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { config } = require("../config");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: "7d" });

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = registerSchema;

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  return res.json({ token: createToken(user) });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({ token: createToken(user) });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true, createdAt: true },
  });
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user.userId },
  });
  return res.json({ user, profile });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId || "",
      clientSecret: config.googleClientSecret || "",
      callbackURL: config.googleCallbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Google account has no email"));
        }

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, googleId },
          });
        } else if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = createToken(req.user);
    const redirectUrl = `${config.clientUrl}/auth/callback?token=${token}`;
    return res.redirect(redirectUrl);
  }
);

module.exports = { authRouter: router };
