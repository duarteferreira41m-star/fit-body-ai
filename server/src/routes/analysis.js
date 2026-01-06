const express = require("express");
const path = require("path");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");
const { analyzePhotos } = require("../utils/openai");

const router = express.Router();

const analysisRequestSchema = z.object({
  photoIds: z.array(z.string()).optional(),
});

const buildPublicUrl = (req, filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  const relative = normalized.split("uploads/").pop();
  return `${req.protocol}://${req.get("host")}/uploads/${relative}`;
};

router.get("/", authenticate, async (req, res) => {
  const analyses = await prisma.analysisResult.findMany({
    where: { userId: req.user.userId },
    orderBy: { date: "desc" },
  });
  return res.json({ analyses });
});

router.post("/run", authenticate, async (req, res) => {
  const parsed = analysisRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { photoIds } = parsed.data;
  const photos = await prisma.photo.findMany({
    where: {
      userId: req.user.userId,
      ...(photoIds?.length ? { id: { in: photoIds } } : {}),
    },
    orderBy: { date: "desc" },
    take: photoIds?.length ? undefined : 3,
  });

  if (!photos.length) {
    return res.status(400).json({ error: "No photos available for analysis" });
  }

  const analysis = await analyzePhotos(
    photos.map((photo) => ({
      ...photo,
      publicUrl: buildPublicUrl(req, photo.filePath),
    }))
  );

  const saved = await prisma.analysisResult.create({
    data: {
      userId: req.user.userId,
      bodyFatEstimate: analysis.bodyFatEstimate,
      symmetryScore: analysis.symmetryScore,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      rawSummary: analysis.summary,
    },
  });

  return res.status(201).json({ analysis: saved });
});

module.exports = { analysisRouter: router };
