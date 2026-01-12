import { getToken } from "@/lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type FetchOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  auth?: boolean;
};

const apiFetch = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
  const headers: Record<string, string> = options.headers ? { ...options.headers } : {};
  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Request failed");
  }

  return (await response.json()) as T;
};

export const api = {
  login: (payload: { email: string; password: string }) =>
    apiFetch<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }),
  register: (payload: { email: string; password: string; name?: string; phone?: string }) =>
    apiFetch<{ token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }),
  me: () => apiFetch<{ user: { id: string; email: string }; profile: unknown }>("/api/auth/me", { auth: true }),
  getProfile: () => apiFetch<{ profile: Profile | null }>("/api/profile", { auth: true }),
  updateProfile: (payload: Partial<ProfilePayload>) =>
    apiFetch<{ profile: Profile }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
  getWorkouts: () => apiFetch<{ workouts: WorkoutLog[] }>("/api/workouts", { auth: true }),
  createWorkout: (payload: WorkoutPayload) =>
    apiFetch<{ workout: WorkoutLog }>("/api/workouts", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
  getDietLogs: () => apiFetch<{ dietLogs: DietLog[] }>("/api/diet", { auth: true }),
  createDietLog: (payload: DietPayload) =>
    apiFetch<{ dietLog: DietLog }>("/api/diet", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
  adjustDietMeal: (payload: {
    mealName: string;
    mealTime: string;
    availableFoods: string;
    planTargets: {
      totalCalories: number;
      protein: { target: number };
      carbs: { target: number };
      fat: { target: number };
    };
    optionMacros: { calories: number; protein: number; carbs: number; fat: number };
    photo?: File | null;
  }) => {
    const form = new FormData();
    form.append("mealName", payload.mealName);
    form.append("mealTime", payload.mealTime);
    form.append("availableFoods", payload.availableFoods);
    form.append("planTargets", JSON.stringify(payload.planTargets));
    form.append("optionMacros", JSON.stringify(payload.optionMacros));
    if (payload.photo) {
      form.append("photo", payload.photo);
    }
    return apiFetch<{
      option: DietPlan["meals"][number]["options"][number];
      reasoning: string;
    }>("/api/diet/adjust-meal", {
      method: "POST",
      body: form,
      auth: true,
    });
  },
  getMeasurements: () => apiFetch<{ measurements: Measurement[] }>("/api/measurements", { auth: true }),
  createMeasurement: (payload: MeasurementPayload) =>
    apiFetch<{ measurement: Measurement }>("/api/measurements", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
  getPhotos: () => apiFetch<{ photos: Photo[] }>("/api/photos", { auth: true }),
  uploadPhoto: (file: File, view: string) => {
    const form = new FormData();
    form.append("photo", file);
    form.append("view", view);
    return apiFetch<{ photo: Photo }>("/api/photos", {
      method: "POST",
      body: form,
      auth: true,
    });
  },
  getExercises: () => apiFetch<{ exercises: Exercise[] }>("/api/exercises", { auth: true }),
  getAnalyses: () => apiFetch<{ analyses: AnalysisResult[] }>("/api/analysis", { auth: true }),
  runAnalysis: (photoIds?: string[]) =>
    apiFetch<{ analysis: AnalysisResult }>("/api/analysis/run", {
      method: "POST",
      body: JSON.stringify({ photoIds }),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
  getDietPlan: () => apiFetch<{ plan: DietPlan; createdAt: string }>("/api/plans/diet", { auth: true }),
  regenerateDietPlan: () =>
    apiFetch<{ plan: DietPlan; createdAt: string }>("/api/plans/diet/regenerate", {
      method: "POST",
      auth: true,
    }),
  getWorkoutPlan: () =>
    apiFetch<{ plan: WorkoutPlan; createdAt: string }>("/api/plans/workout", { auth: true }),
  regenerateWorkoutPlan: () =>
    apiFetch<{ plan: WorkoutPlan; createdAt: string }>("/api/plans/workout/regenerate", {
      method: "POST",
      auth: true,
    }),
  getRestSuggestion: (payload: {
    exercise: { name: string; muscleGroup: string; sets: number; reps: string; rest?: string };
  }) =>
    apiFetch<{ suggestedRest: string; reasoning: string }>("/api/workouts/rest-suggestion", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
  getExerciseSubstitution: (payload: {
    exercise: { name: string; muscleGroup: string; sets: number; reps: string; rest?: string };
    reason: string;
  }) =>
    apiFetch<{
      substitute: WorkoutPlan["workouts"][number]["exercises"][number];
      reasoning: string;
    }>("/api/workouts/substitute", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
  sendChatMessage: (payload: { message: string; page?: string }) =>
    apiFetch<{ response: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      auth: true,
    }),
};

export type Profile = {
  id?: string;
  name?: string | null;
  age?: number | null;
  birthDate?: string | null;
  heightCm?: number | null;
  gender?: string | null;
  goal?: string | null;
  activityLevel?: string | null;
  wakeUpTime?: string | null;
  firstMealTime?: string | null;
  trainingTime?: string | null;
  trainingDays?: number | null;
  trainingDurationMin?: number | null;
  preferredFoods?: string | null;
  allergies?: string | null;
  usesSteroids?: boolean | null;
  steroids?: string | null;
};

export type ProfilePayload = Omit<Profile, "id">;

export type WorkoutLog = {
  id: string;
  name: string;
  date: string;
  durationMin?: number | null;
  calories?: number | null;
  notes?: string | null;
};

export type WorkoutPayload = {
  name: string;
  date?: string;
  durationMin?: number;
  calories?: number;
  notes?: string;
};

export type DietLog = {
  id: string;
  date: string;
  calories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  waterLiters?: number | null;
  notes?: string | null;
};

export type DietPayload = Omit<DietLog, "id">;

export type Measurement = {
  id: string;
  date: string;
  weightKg?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  chestCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  bodyFatPct?: number | null;
};

export type MeasurementPayload = Omit<Measurement, "id">;

export type Photo = {
  id: string;
  view: string;
  filePath: string;
  date: string;
};

export type Exercise = {
  id: string;
  name: string;
  muscleGroup?: string | null;
  youtubeUrl?: string | null;
};

export type AnalysisResult = {
  id: string;
  date: string;
  bodyFatEstimate?: number | null;
  symmetryScore?: number | null;
  strengths: string[];
  weaknesses: string[];
  rawSummary?: string | null;
};

export type DietPlan = {
  totalCalories: number;
  protein: { target: number };
  carbs: { target: number };
  fat: { target: number };
  water: { target: number };
  meals: {
    name: string;
    time: string;
    options: {
      label: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      foods: string[];
    }[];
  }[];
};

export type WorkoutPlan = {
  workouts: {
    day?: number;
    name: string;
    durationMin: number;
    calories: number;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      muscleGroup: string;
      rest: string;
      instructions: string[];
    }[];
  }[];
};
