const express = require("express");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");
const { generateDietPlan, generateWorkoutPlan } = require("../utils/openai");

const router = express.Router();

const loadContext = async (userId) => {
  const [profile, measurement] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.measurement.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    }),
  ]);

  return { profile, measurement };
};

const getLatestPlan = async (userId, type) =>
  prisma.plan.findFirst({
    where: { userId, type },
    orderBy: { createdAt: "desc" },
  });

const savePlan = async (userId, type, data) =>
  prisma.plan.create({
    data: {
      userId,
      type,
      data,
    },
  });

const generatePlanForType = async (type, context) => {
  if (type === "diet") {
    return generateDietPlan(context);
  }
  if (type === "workout") {
    return generateWorkoutPlan(context);
  }
  throw new Error("Unsupported plan type");
};

router.get("/:type", authenticate, async (req, res) => {
  const { type } = req.params;
  if (!["diet", "workout"].includes(type)) {
    return res.status(400).json({ error: "Invalid plan type" });
  }

  const latest = await getLatestPlan(req.user.userId, type);
  if (latest) {
    return res.json({ plan: latest.data, createdAt: latest.createdAt });
  }

  const context = await loadContext(req.user.userId);
  const generated = await generatePlanForType(type, context);
  const saved = await savePlan(req.user.userId, type, generated);

  return res.json({ plan: saved.data, createdAt: saved.createdAt });
});

router.post("/:type/regenerate", authenticate, async (req, res) => {
  const { type } = req.params;
  if (!["diet", "workout"].includes(type)) {
    return res.status(400).json({ error: "Invalid plan type" });
  }

  const context = await loadContext(req.user.userId);
  const generated = await generatePlanForType(type, context);
  const saved = await savePlan(req.user.userId, type, generated);

  return res.status(201).json({ plan: saved.data, createdAt: saved.createdAt });
});

module.exports = { plansRouter: router };
