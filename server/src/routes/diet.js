const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");

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

module.exports = { dietRouter: router };
