const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().min(10).max(120).optional(),
  birthDate: z.string().datetime().optional(),
  heightCm: z.number().int().min(50).max(260).optional(),
  gender: z.string().min(1).optional(),
  goal: z.string().min(1).optional(),
  activityLevel: z.string().min(1).optional(),
  wakeUpTime: z.string().min(1).optional(),
  firstMealTime: z.string().min(1).optional(),
  trainingTime: z.string().min(1).optional(),
  trainingDays: z.number().int().min(1).max(7).optional(),
  trainingDurationMin: z.number().int().min(10).max(240).optional(),
  preferredFoods: z.string().min(1).optional(),
  allergies: z.string().min(1).optional(),
  usesSteroids: z.boolean().optional(),
  steroids: z.string().min(1).optional(),
});

router.get("/", authenticate, async (req, res) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user.userId },
  });
  return res.json({ profile });
});

router.put("/", authenticate, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const data = parsed.data;
  const profile = await prisma.profile.upsert({
    where: { userId: req.user.userId },
    update: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    },
    create: {
      userId: req.user.userId,
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    },
  });

  return res.json({ profile });
});

module.exports = { profileRouter: router };
