const { z } = require("zod");
const { config } = require("../config");

const analysisSchema = z.object({
  bodyFatEstimate: z.number().min(1).max(60).optional(),
  symmetryScore: z.number().min(0).max(100).optional(),
  strengths: z.array(z.string()).min(1).max(10),
  weaknesses: z.array(z.string()).min(1).max(10),
  summary: z.string().min(1).max(800).optional(),
});

const dietPlanSchema = z.object({
  totalCalories: z.number().min(800).max(6000),
  protein: z.object({ target: z.number().min(40).max(350) }),
  carbs: z.object({ target: z.number().min(40).max(700) }),
  fat: z.object({ target: z.number().min(20).max(200) }),
  water: z.object({ target: z.number().min(1).max(8) }),
  meals: z
    .array(
      z.object({
        name: z.string().min(1),
        time: z.string().min(1),
        calories: z.number().min(0),
        protein: z.number().min(0),
        carbs: z.number().min(0),
        fat: z.number().min(0),
        foods: z.array(z.string().min(1)).min(1).max(12),
      })
    )
    .min(3)
    .max(8),
});

const workoutPlanSchema = z.object({
  name: z.string().min(1),
  durationMin: z.number().min(20).max(180),
  calories: z.number().min(50).max(1500),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1),
        sets: z.number().min(1).max(8),
        reps: z.string().min(1),
        muscleGroup: z.string().min(1),
        rest: z.string().min(1),
        instructions: z.array(z.string().min(1)).min(2).max(8),
      })
    )
    .min(4)
    .max(10),
});

const dietAdjustSchema = z.object({
  response: z.string().min(1).max(1200),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.string().min(1),
        calories: z.number().min(0),
        proteinG: z.number().min(0),
        carbsG: z.number().min(0),
        fatG: z.number().min(0),
        fiberG: z.number().min(0),
      })
    )
    .min(1)
    .max(12),
  totals: z.object({
    calories: z.number().min(0),
    proteinG: z.number().min(0),
    carbsG: z.number().min(0),
    fatG: z.number().min(0),
    fiberG: z.number().min(0),
  }),
  assumptions: z.array(z.string().min(1)).max(6).optional(),
});

const buildPrompt = () => [
  {
    role: "system",
    content:
      "You are a fitness coach analyzing physique photos. " +
      "Return JSON only, with keys: bodyFatEstimate (number), symmetryScore (0-100), strengths (array), weaknesses (array), summary (string). " +
      "Be cautious and approximate. Do not include medical advice.",
  },
  {
    role: "user",
    content:
      "Analyze the provided photos. Estimate body fat percentage, symmetry, strengths, and weaknesses. " +
      "Return JSON only, no markdown.",
  },
];

const buildPlanContext = (profile, measurement) => ({
  profile: {
    name: profile?.name || null,
    age: profile?.age || null,
    gender: profile?.gender || null,
    heightCm: profile?.heightCm || null,
    goal: profile?.goal || null,
    activityLevel: profile?.activityLevel || null,
    wakeUpTime: profile?.wakeUpTime || null,
    firstMealTime: profile?.firstMealTime || null,
    trainingTime: profile?.trainingTime || null,
    trainingDays: profile?.trainingDays || null,
    trainingDurationMin: profile?.trainingDurationMin || null,
    preferredFoods: profile?.preferredFoods || null,
    allergies: profile?.allergies || null,
    usesSteroids: profile?.usesSteroids || null,
    steroids: profile?.steroids || null,
  },
  latestMeasurement: {
    weightKg: measurement?.weightKg || null,
    bodyFatPct: measurement?.bodyFatPct || null,
  },
});

const requestOpenAIJson = async (messages) => {
  if (!config.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.openaiModel,
      temperature: 0.2,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error: ${detail}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("OpenAI response was not valid JSON");
  }

  return parsed;
};

const analyzePhotos = async (photos) => {
  const imageParts = photos.map((photo) => ({
    type: "image_url",
    image_url: {
      url: photo.publicUrl,
    },
  }));

  const parsed = await requestOpenAIJson([
    ...buildPrompt(),
    {
      role: "user",
      content: [{ type: "text", text: "Photos for analysis:" }, ...imageParts],
    },
  ]);

  const result = analysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }

  return result.data;
};

const generateDietPlan = async ({ profile, measurement }) => {
  const context = buildPlanContext(profile, measurement);
  const parsed = await requestOpenAIJson([
    {
      role: "system",
      content:
        "You are a nutrition coach. Return JSON only with keys: " +
        "totalCalories, protein{target}, carbs{target}, fat{target}, water{target}, meals[] " +
        "(each meal: name, time, calories, protein, carbs, fat, foods[]).",
    },
    {
      role: "user",
      content:
        "Create a one-day meal plan in Portuguese tailored to the user context below. " +
        "Keep it realistic for a fitness plan and align meal times with routine when provided. " +
        "Return JSON only, no markdown.\n\n" +
        JSON.stringify(context),
    },
  ]);

  const result = dietPlanSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }

  return result.data;
};

const generateWorkoutPlan = async ({ profile, measurement }) => {
  const context = buildPlanContext(profile, measurement);
  const parsed = await requestOpenAIJson([
    {
      role: "system",
      content:
        "You are a fitness coach. Return JSON only with keys: " +
        "name, durationMin, calories, exercises[] (each: name, sets, reps, muscleGroup, rest, instructions[]).",
    },
    {
      role: "user",
      content:
        "Create a single workout session plan in Portuguese tailored to the user context below. " +
        "Keep it realistic and safe. Return JSON only, no markdown.\n\n" +
        JSON.stringify(context),
    },
  ]);

  const result = workoutPlanSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }

  return result.data;
};

const generateDietAdjustment = async ({ message, availableFoods, targetMacros, photoUrl }) => {
  const context = {
    message,
    availableFoods: availableFoods || null,
    targets: targetMacros,
  };

  const userParts = [
    {
      type: "text",
      text:
        "Ajuste a dieta para manter as metas diárias. " +
        "Sugira porções e quantidades aproximadas para os alimentos disponíveis. " +
        "Se houver foto, identifique o alimento e estime porções. " +
        "Responda apenas com JSON conforme solicitado.\n\n" +
        JSON.stringify(context),
    },
  ];

  if (photoUrl) {
    userParts.push({ type: "image_url", image_url: { url: photoUrl } });
  }

  const parsed = await requestOpenAIJson([
    {
      role: "system",
      content:
        "Você é um nutricionista esportivo. " +
        "Retorne JSON com keys: response (string), items (array de itens com name, quantity, calories, proteinG, carbsG, fatG, fiberG), " +
        "totals (calories, proteinG, carbsG, fatG, fiberG), assumptions (array opcional). " +
        "Mantenha totais o mais perto possível das metas (tolerância ~5%). " +
        "Calcule valores aproximados quando não houver dados precisos.",
    },
    {
      role: "user",
      content: userParts,
    },
  ]);

  const result = dietAdjustSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }

  return result.data;
};

module.exports = { analyzePhotos, generateDietPlan, generateWorkoutPlan, generateDietAdjustment };
