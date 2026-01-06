const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const workoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  durationMin: z.number().int().min(1).optional(),
  calories: z.number().int().min(0).optional(),
});

router.get("/", authenticate, async (req, res) => {
  const workouts = await prisma.workoutLog.findMany({
    where: { userId: req.user.userId },
    orderBy: { date: "desc" },
  });
  return res.json({ workouts });
});

router.post("/", authenticate, async (req, res) => {
  const parsed = workoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const data = parsed.data;
  const workout = await prisma.workoutLog.create({
    data: {
      userId: req.user.userId,
      name: data.name,
      notes: data.notes,
      durationMin: data.durationMin,
      calories: data.calories,
      date: data.date ? new Date(data.date) : undefined,
    },
  });

  return res.status(201).json({ workout });
});

router.delete("/:id", authenticate, async (req, res) => {
  await prisma.workoutLog.deleteMany({
    where: { id: req.params.id, userId: req.user.userId },
  });
  return res.status(204).send();
});

module.exports = { workoutsRouter: router };
