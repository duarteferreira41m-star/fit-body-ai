const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const exerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroup: z.string().min(1).optional(),
  youtubeUrl: z.string().url().optional(),
});

router.get("/", authenticate, async (_req, res) => {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });
  return res.json({ exercises });
});

router.post("/", authenticate, async (req, res) => {
  const parsed = exerciseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const exercise = await prisma.exercise.create({
    data: parsed.data,
  });
  return res.status(201).json({ exercise });
});

module.exports = { exercisesRouter: router };
