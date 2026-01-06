const express = require("express");
const { z } = require("zod");
const path = require("path");
const multer = require("multer");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");
const { config } = require("../config");
const { generateDietAdjustment } = require("../utils/openai");

const router = express.Router();

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

const dietSchema = z.object({
  date: z.string().datetime().optional(),
  calories: z.number().int().min(0).optional(),
  proteinG: z.number().int().min(0).optional(),
  carbsG: z.number().int().min(0).optional(),
  fatG: z.number().int().min(0).optional(),
  waterLiters: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
});

const dietAdjustSchema = z.object({
  message: z.string().min(1),
  availableFoods: z.string().optional(),
  targetMacros: z.object({
    calories: z.number().min(0),
    proteinG: z.number().min(0),
    carbsG: z.number().min(0),
    fatG: z.number().min(0),
    fiberG: z.number().min(0).optional(),
  }),
});

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

router.post("/adjust", authenticate, upload.single("photo"), async (req, res) => {
  const rawTargetMacros = req.body.targetMacros;
  let targetMacros;
  try {
    targetMacros = rawTargetMacros ? JSON.parse(rawTargetMacros) : null;
  } catch (error) {
    return res.status(400).json({ error: "Invalid targetMacros" });
  }

  const parsed = dietAdjustSchema.safeParse({
    message: req.body.message,
    availableFoods: req.body.availableFoods,
    targetMacros,
  });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const photoUrl = req.file ? buildPublicUrl(req, req.file.path) : null;

  try {
    const adjustment = await generateDietAdjustment({
      ...parsed.data,
      photoUrl,
    });
    return res.json({ adjustment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to adjust diet" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  await prisma.dietLog.deleteMany({
    where: { id: req.params.id, userId: req.user.userId },
  });
  return res.status(204).send();
});

module.exports = { dietRouter: router };
