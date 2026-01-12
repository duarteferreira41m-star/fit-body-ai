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
        options: z
          .array(
            z.object({
              label: z.string().min(1),
              calories: z.number().min(0),
              protein: z.number().min(0),
              carbs: z.number().min(0),
              fat: z.number().min(0),
              foods: z.array(z.string().min(1)).min(1).max(12),
            })
          )
          .length(3),
      })
    )
    .min(3)
    .max(8),
});

const workoutPlanSchema = z.object({
  workouts: z
    .array(
      z.object({
        day: z.number().min(1).max(7),
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
      })
    )
    .min(1)
    .max(7),
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

const requestOpenAIText = async (messages) => {
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
      temperature: 0.4,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error: ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
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
        "(each meal: name, time, options[3] with label, calories, protein, carbs, fat, foods[]).",
    },
    {
      role: "user",
      content:
        "Create a one-day meal plan in Portuguese tailored to the user context below. " +
        "Each meal must include 3 different options of foods, keeping macros similar. " +
        "You may include foods beyond user preferences when needed for a complete diet. " +
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
  const trainingDays = profile?.trainingDays || 3;
  const parsed = await requestOpenAIJson([
    {
      role: "system",
      content:
        "You are a fitness coach. Return JSON only with keys: " +
        "workouts[] (each: day, name, durationMin, calories, exercises[] with name, sets, reps, muscleGroup, rest, instructions[]).",
    },
    {
      role: "user",
      content:
        `Create a weekly workout plan in Portuguese with ${trainingDays} sessions tailored to the user context below. ` +
        "Distribute muscle groups sensibly and keep it safe. Return JSON only, no markdown.\n\n" +
        JSON.stringify(context),
    },
  ]);

  const result = workoutPlanSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }

  return result.data;
};

const adjustMealPlan = async ({ planTargets, meal, availableFoods, photoUrl }) => {
  const userContent = [
    {
      type: "text",
      text:
        "The user cannot find the planned foods. Suggest a new meal option in Portuguese " +
        "using the available foods and/or the meal photo. Keep macros close to the target. " +
        "Return JSON only, no markdown.\n\n" +
        JSON.stringify({ planTargets, meal, availableFoods }),
    },
  ];
  if (photoUrl) {
    userContent.push({ type: "image_url", image_url: { url: photoUrl } });
  }

  const parsed = await requestOpenAIJson([
    {
      role: "system",
      content:
        "You are a nutrition coach. Return JSON only with keys: " +
        "option{label, calories, protein, carbs, fat, foods[]}, reasoning. " +
        "Keep macros close to the meal target.",
    },
    {
      role: "user",
      content: userContent,
    },
  ]);

  const schema = z.object({
    option: z.object({
      label: z.string().min(1),
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
      foods: z.array(z.string().min(1)).min(1).max(12),
    }),
    reasoning: z.string().min(1),
  });
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }
  return result.data;
};

const suggestRestTime = async ({ exercise, profile, measurement }) => {
  const parsed = await requestOpenAIJson([
    {
      role: "system",
      content:
        "You are a strength coach. Return JSON only with keys: suggestedRest, reasoning. " +
        "Use technical but concise language.",
    },
    {
      role: "user",
      content:
        "Suggest rest time in Portuguese for the exercise below, considering user context. " +
        "Return JSON only, no markdown.\n\n" +
        JSON.stringify({ exercise, profile, measurement }),
    },
  ]);

  const schema = z.object({
    suggestedRest: z.string().min(1),
    reasoning: z.string().min(1),
  });
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }
  return result.data;
};

const suggestExerciseSubstitution = async ({ exercise, reason, profile, measurement }) => {
  const parsed = await requestOpenAIJson([
    {
      role: "system",
      content:
        "You are a strength coach. Return JSON only with keys: substitute, reasoning. " +
        "Substitute must include name, sets, reps, muscleGroup, rest, instructions[].",
    },
    {
      role: "user",
      content:
        "Suggest a substitute exercise in Portuguese for the exercise below, considering " +
        "user level, weight, and reason for substitution. Return JSON only, no markdown.\n\n" +
        JSON.stringify({ exercise, reason, profile, measurement }),
    },
  ]);

  const schema = z.object({
    substitute: z.object({
      name: z.string().min(1),
      sets: z.number().min(1).max(8),
      reps: z.string().min(1),
      muscleGroup: z.string().min(1),
      rest: z.string().min(1),
      instructions: z.array(z.string().min(1)).min(2).max(8),
    }),
    reasoning: z.string().min(1),
  });
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response failed validation");
  }
  return result.data;
};

const generateCoachResponse = async ({ message, context, page }) => {
  const systemPrompt =
    "You are an expert fitness and nutrition coach. Reply in Portuguese with clear, actionable guidance. " +
    "Ask at most one follow-up question when helpful. Avoid medical claims.";
  const userPrompt =
    "User message:\n" +
    message +
    "\n\nPage context:\n" +
    page +
    "\n\nUser context JSON:\n" +
    JSON.stringify(context);

  return requestOpenAIText([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
};

module.exports = {
  analyzePhotos,
  generateDietPlan,
  generateWorkoutPlan,
  adjustMealPlan,
  suggestRestTime,
  suggestExerciseSubstitution,
  generateCoachResponse,
};
