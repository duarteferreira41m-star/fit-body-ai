const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const measurementSchema = z.object({
  date: z.string().datetime().optional(),
  weightKg: z.number().min(20).max(300).optional(),
  waistCm: z.number().min(30).max(200).optional(),
  hipCm: z.number().min(30).max(200).optional(),
  chestCm: z.number().min(30).max(200).optional(),
  armCm: z.number().min(10).max(100).optional(),
  thighCm: z.number().min(20).max(200).optional(),
  bodyFatPct: z.number().min(1).max(60).optional(),
});

router.get("/", authenticate, async (req, res) => {
  const measurements = await prisma.measurement.findMany({
    where: { userId: req.user.userId },
    orderBy: { date: "desc" },
  });
  return res.json({ measurements });
});

router.post("/", authenticate, async (req, res) => {
  const parsed = measurementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const data = parsed.data;
  const measurement = await prisma.measurement.create({
    data: {
      userId: req.user.userId,
      date: data.date ? new Date(data.date) : undefined,
      weightKg: data.weightKg,
      waistCm: data.waistCm,
      hipCm: data.hipCm,
      chestCm: data.chestCm,
      armCm: data.armCm,
      thighCm: data.thighCm,
      bodyFatPct: data.bodyFatPct,
    },
  });

  return res.status(201).json({ measurement });
});

router.delete("/:id", authenticate, async (req, res) => {
  await prisma.measurement.deleteMany({
    where: { id: req.params.id, userId: req.user.userId },
  });
  return res.status(204).send();
});

module.exports = { measurementsRouter: router };
