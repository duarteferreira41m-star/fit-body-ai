import { jsPDF } from "jspdf";
import type { DietPlan, WorkoutPlan } from "@/lib/api";

const PAGE_MARGIN = 14;
const LINE_HEIGHT = 6;

const createDoc = (title: string) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, PAGE_MARGIN, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  return doc;
};

const addWrappedText = (doc: jsPDF, text: string, y: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - PAGE_MARGIN * 2;
  const lines = doc.splitTextToSize(text, maxWidth);
  let cursor = y;
  lines.forEach((line) => {
    if (cursor > doc.internal.pageSize.getHeight() - PAGE_MARGIN) {
      doc.addPage();
      cursor = PAGE_MARGIN;
    }
    doc.text(line, PAGE_MARGIN, cursor);
    cursor += LINE_HEIGHT;
  });
  return cursor;
};

const normalizeDietPlan = (plan: DietPlan) => {
  const meals = plan.meals.map((meal) => {
    if ("options" in meal && Array.isArray(meal.options)) {
      return meal;
    }
    const legacy = meal as unknown as {
      name: string;
      time: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      foods?: string[];
    };
    const baseOption = {
      label: "Opcao 1",
      calories: legacy.calories || 0,
      protein: legacy.protein || 0,
      carbs: legacy.carbs || 0,
      fat: legacy.fat || 0,
      foods: legacy.foods || [],
    };
    return {
      name: legacy.name,
      time: legacy.time,
      options: [
        baseOption,
        { ...baseOption, label: "Opcao 2" },
        { ...baseOption, label: "Opcao 3" },
      ],
    };
  });
  return { ...plan, meals };
};

const normalizeWorkoutPlan = (plan: WorkoutPlan) => {
  if (Array.isArray(plan.workouts)) {
    return plan;
  }
  const legacy = plan as unknown as {
    name?: string;
    durationMin?: number;
    calories?: number;
    exercises?: WorkoutPlan["workouts"][number]["exercises"];
  };
  return {
    workouts: legacy.name
      ? [
          {
            day: 1,
            name: legacy.name,
            durationMin: legacy.durationMin || 0,
            calories: legacy.calories || 0,
            exercises: legacy.exercises || [],
          },
        ]
      : [],
  };
};

export const downloadDietPlanPdf = (plan: DietPlan) => {
  const normalized = normalizeDietPlan(plan);
  const doc = createDoc("Plano de dieta");
  let y = 24;

  y = addWrappedText(
    doc,
    `Calorias: ${normalized.totalCalories} kcal | Proteina: ${normalized.protein.target}g | Carbos: ${normalized.carbs.target}g | Gordura: ${normalized.fat.target}g | Agua: ${normalized.water.target}L`,
    y
  );
  y += 4;

  normalized.meals.forEach((meal, index) => {
    y = addWrappedText(doc, `${index + 1}. ${meal.name} - ${meal.time}`, y);
    meal.options.forEach((option) => {
      y = addWrappedText(
        doc,
        `  ${option.label}: ${option.calories} kcal | P ${option.protein}g | C ${option.carbs}g | G ${option.fat}g`,
        y
      );
      y = addWrappedText(doc, `  Itens: ${option.foods.join(", ")}`, y);
    });
    y += 2;
  });

  doc.save("plano-dieta.pdf");
};

export const downloadWorkoutPlanPdf = (plan: WorkoutPlan) => {
  const normalized = normalizeWorkoutPlan(plan);
  const doc = createDoc("Plano de treino");
  let y = 24;

  normalized.workouts.forEach((workout, index) => {
    const label = workout.day ? `Dia ${workout.day}` : `Treino ${index + 1}`;
    y = addWrappedText(
      doc,
      `${label}: ${workout.name} (${workout.durationMin} min, ${workout.calories} kcal)`,
      y
    );
    workout.exercises.forEach((exercise, exerciseIndex) => {
      y = addWrappedText(
        doc,
        `  ${exerciseIndex + 1}. ${exercise.name} - ${exercise.sets}x${exercise.reps} (${exercise.muscleGroup})`,
        y
      );
    });
    y += 2;
  });

  doc.save("plano-treino.pdf");
};
