const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");
const { suggestRestTime, suggestExerciseSubstitution } = require("../utils/openai");

const router = express.Router();

const workoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  durationMin: z.number().int().min(1).optional(),
  calories: z.number().int().min(0).optional(),
});

const restSuggestionSchema = z.object({
  exercise: z.object({
    name: z.string().min(1),
    muscleGroup: z.string().min(1),
    sets: z.number().min(1),
    reps: z.string().min(1),
    rest: z.string().min(1).optional(),
  }),
});

const substituteSchema = z.object({
  exercise: z.object({
    name: z.string().min(1),
    muscleGroup: z.string().min(1),
    sets: z.number().min(1),
    reps: z.string().min(1),
    rest: z.string().min(1).optional(),
  }),
  reason: z.string().min(1).max(500),
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

router.post("/rest-suggestion", authenticate, async (req, res) => {
  const parsed = restSuggestionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const [profile, measurement] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: req.user.userId } }),
    prisma.measurement.findFirst({
      where: { userId: req.user.userId },
      orderBy: { date: "desc" },
    }),
  ]);

  const suggestion = await suggestRestTime({
    exercise: parsed.data.exercise,
    profile,
    measurement,
  });

  return res.json(suggestion);
});

router.post("/substitute", authenticate, async (req, res) => {
  const parsed = substituteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const [profile, measurement] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: req.user.userId } }),
    prisma.measurement.findFirst({
      where: { userId: req.user.userId },
      orderBy: { date: "desc" },
    }),
  ]);

  const suggestion = await suggestExerciseSubstitution({
    exercise: parsed.data.exercise,
    reason: parsed.data.reason,
    profile,
    measurement,
  });

  return res.json(suggestion);
});

module.exports = { workoutsRouter: router };
