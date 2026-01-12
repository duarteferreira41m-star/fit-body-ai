const express = require("express");
const path = require("path");
const multer = require("multer");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");
const { config } = require("../config");
const { adjustMealPlan } = require("../utils/openai");

const router = express.Router();

const dietSchema = z.object({
  date: z.string().datetime().optional(),
  calories: z.number().int().min(0).optional(),
  proteinG: z.number().int().min(0).optional(),
  carbsG: z.number().int().min(0).optional(),
  fatG: z.number().int().min(0).optional(),
  waterLiters: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
});

const mealAdjustmentSchema = z.object({
  mealName: z.string().min(1),
  mealTime: z.string().min(1),
  availableFoods: z.string().min(1),
  planTargets: z.string().min(1),
  optionMacros: z.string().min(1),
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadsPath);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const buildPublicUrl = (req, filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  const relative = normalized.split("uploads/").pop();
  return `${req.protocol}://${req.get("host")}/uploads/${relative}`;
};

router.get("/", authenticate, async (req, res) => {
  const dietLogs = await prisma.dietLog.findMany({
    where: { userId: req.user.userId },
    orderBy: { date: "desc" },
  });
  return res.json({ dietLogs });
});

router.post("/", authenticate, async (req, res) => {
  const parsed = dietSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const data = parsed.data;
  const dietLog = await prisma.dietLog.create({
    data: {
      userId: req.user.userId,
      date: data.date ? new Date(data.date) : undefined,
      calories: data.calories,
      proteinG: data.proteinG,
      carbsG: data.carbsG,
      fatG: data.fatG,
      waterLiters: data.waterLiters,
      notes: data.notes,
    },
  });

  return res.status(201).json({ dietLog });
});

router.delete("/:id", authenticate, async (req, res) => {
  await prisma.dietLog.deleteMany({
    where: { id: req.params.id, userId: req.user.userId },
  });
  return res.status(204).send();
});

router.post("/adjust-meal", authenticate, upload.single("photo"), async (req, res) => {
  const parsed = mealAdjustmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { mealName, mealTime, availableFoods, planTargets, optionMacros } = parsed.data;
  let photoUrl = null;
  if (req.file) {
    photoUrl = buildPublicUrl(req, path.relative(process.cwd(), req.file.path));
  }

  let parsedTargets;
  let parsedMacros;
  try {
    parsedTargets = JSON.parse(planTargets);
    parsedMacros = JSON.parse(optionMacros);
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  const adjustment = await adjustMealPlan({
    planTargets: parsedTargets,
    meal: { name: mealName, time: mealTime, optionMacros: parsedMacros },
    availableFoods,
    photoUrl,
  });

  return res.json(adjustment);
});

module.exports = { dietRouter: router };
