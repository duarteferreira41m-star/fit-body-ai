const express = require("express");
const path = require("path");
const multer = require("multer");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { authenticate } = require("../middleware/auth");
const { config } = require("../config");

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

const photoSchema = z.object({
  view: z.string().min(1),
  date: z.string().datetime().optional(),
});

router.get("/", authenticate, async (req, res) => {
  const photos = await prisma.photo.findMany({
    where: { userId: req.user.userId },
    orderBy: { date: "desc" },
  });
  return res.json({ photos });
});

router.post("/", authenticate, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Missing photo upload" });
  }

  const parsed = photoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const data = parsed.data;
  const photo = await prisma.photo.create({
    data: {
      userId: req.user.userId,
      view: data.view,
      date: data.date ? new Date(data.date) : undefined,
      filePath: path.relative(process.cwd(), req.file.path),
    },
  });

  return res.status(201).json({ photo });
});

router.delete("/:id", authenticate, async (req, res) => {
  await prisma.photo.deleteMany({
    where: { id: req.params.id, userId: req.user.userId },
  });
  return res.status(204).send();
});

module.exports = { photosRouter: router };
