const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");
const { generateCoachResponse } = require("../utils/openai");

const router = express.Router();

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  page: z.string().min(1).max(40).optional(),
});

const getLatestPlan = async (userId, type) =>
  prisma.plan.findFirst({
    where: { userId, type },
    orderBy: { createdAt: "desc" },
  });

router.post("/", authenticate, async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { message, page } = parsed.data;
  const [profile, measurement, dietPlan, workoutPlan] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: req.user.userId } }),
    prisma.measurement.findFirst({
      where: { userId: req.user.userId },
      orderBy: { date: "desc" },
    }),
    getLatestPlan(req.user.userId, "diet"),
    getLatestPlan(req.user.userId, "workout"),
  ]);

  const context = {
    profile,
    latestMeasurement: measurement,
    dietPlan: dietPlan?.data || null,
    workoutPlan: workoutPlan?.data || null,
  };

  const response = await generateCoachResponse({
    message,
    page: page || "general",
    context,
  });

  return res.json({ response });
});

module.exports = { chatRouter: router };
