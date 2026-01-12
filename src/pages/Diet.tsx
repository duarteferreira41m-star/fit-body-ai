import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { ProgressRing } from "@/components/ProgressRing";
import { ChatBox } from "@/components/ChatBox";
import { motion } from "framer-motion";
import { Flame, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { downloadDietPlanPdf } from "@/lib/pdf";
import type { DietPlan } from "@/lib/api";

const fallbackDietPlan = {
  totalCalories: 2500,
  protein: { target: 180 },
  carbs: { target: 280 },
  fat: { target: 70 },
  water: { target: 3 },
  meals: [
    {
      name: "Cafe da Manha",
      time: "07:00",
      options: [
        {
          label: "Opcao 1",
          calories: 520,
          protein: 35,
          carbs: 55,
          fat: 18,
          foods: ["4 ovos mexidos", "2 fatias pao integral", "1 banana", "Cafe preto"],
        },
        {
          label: "Opcao 2",
          calories: 510,
          protein: 32,
          carbs: 60,
          fat: 16,
          foods: ["Iogurte natural", "Granola", "1 maca", "Cafe preto"],
        },
        {
          label: "Opcao 3",
          calories: 530,
          protein: 36,
          carbs: 52,
          fat: 19,
          foods: ["Omelete com queijo", "Torradas integrais", "1 pera"],
        },
      ],
    },
    {
      name: "Lanche da Manha",
      time: "10:00",
      options: [
        {
          label: "Opcao 1",
          calories: 280,
          protein: 28,
          carbs: 25,
          fat: 8,
          foods: ["Shake de whey", "1 maca", "30g amendoim"],
        },
        {
          label: "Opcao 2",
          calories: 270,
          protein: 26,
          carbs: 30,
          fat: 6,
          foods: ["Iogurte grego", "1 banana", "Mel"],
        },
        {
          label: "Opcao 3",
          calories: 290,
          protein: 25,
          carbs: 28,
          fat: 9,
          foods: ["Queijo cottage", "Pao integral", "Uvas"],
        },
      ],
    },
    {
      name: "Almoco",
      time: "12:30",
      options: [
        {
          label: "Opcao 1",
          calories: 680,
          protein: 45,
          carbs: 70,
          fat: 18,
          foods: ["200g frango grelhado", "150g arroz integral", "Salada verde", "Legumes"],
        },
        {
          label: "Opcao 2",
          calories: 670,
          protein: 42,
          carbs: 72,
          fat: 17,
          foods: ["200g peixe grelhado", "150g batata doce", "Salada", "Azeite"],
        },
        {
          label: "Opcao 3",
          calories: 690,
          protein: 46,
          carbs: 68,
          fat: 19,
          foods: ["200g carne magra", "150g arroz", "Legumes no vapor"],
        },
      ],
    },
    {
      name: "Pre-Treino",
      time: "15:30",
      options: [
        {
          label: "Opcao 1",
          calories: 370,
          protein: 27,
          carbs: 45,
          fat: 8,
          foods: ["Batata doce", "150g peito de frango", "Suco natural"],
        },
        {
          label: "Opcao 2",
          calories: 360,
          protein: 25,
          carbs: 50,
          fat: 6,
          foods: ["Tapioca", "Ovos", "Suco de laranja"],
        },
        {
          label: "Opcao 3",
          calories: 380,
          protein: 28,
          carbs: 42,
          fat: 9,
          foods: ["Aveia", "Whey", "1 banana"],
        },
      ],
    },
    {
      name: "Pos-Treino",
      time: "18:00",
      options: [
        {
          label: "Opcao 1",
          calories: 320,
          protein: 35,
          carbs: 40,
          fat: 5,
          foods: ["Whey protein", "1 banana", "Maltodextrina"],
        },
        {
          label: "Opcao 2",
          calories: 330,
          protein: 32,
          carbs: 42,
          fat: 6,
          foods: ["Iogurte", "Mel", "Frutas vermelhas"],
        },
        {
          label: "Opcao 3",
          calories: 310,
          protein: 34,
          carbs: 38,
          fat: 5,
          foods: ["Ovos", "Pao integral", "1 kiwi"],
        },
      ],
    },
    {
      name: "Jantar",
      time: "20:00",
      options: [
        {
          label: "Opcao 1",
          calories: 530,
          protein: 40,
          carbs: 45,
          fat: 20,
          foods: ["200g carne", "Pure de batata", "Brocolis", "Azeite"],
        },
        {
          label: "Opcao 2",
          calories: 520,
          protein: 38,
          carbs: 50,
          fat: 18,
          foods: ["Frango desfiado", "Arroz", "Legumes", "Azeite"],
        },
        {
          label: "Opcao 3",
          calories: 540,
          protein: 42,
          carbs: 40,
          fat: 21,
          foods: ["Peixe", "Batata", "Salada"],
        },
      ],
    },
  ],
};

const Diet = () => {
  const queryClient = useQueryClient();
  const [customPlan, setCustomPlan] = useState<DietPlan | null>(null);
  const [mealAdjustments, setMealAdjustments] = useState<
    Record<
      number,
      {
        isOpen: boolean;
        availableFoods: string;
        photo?: File | null;
        isLoading?: boolean;
        suggestion?: { option: DietPlan["meals"][number]["options"][number]; reasoning: string };
        error?: string;
      }
    >
  >({});
  const { data: dietPlanData, isLoading: isDietPlanLoading } = useQuery({
    queryKey: ["dietPlan"],
    queryFn: () => api.getDietPlan(),
  });
  const { data: dietData } = useQuery({
    queryKey: ["dietLogs"],
    queryFn: () => api.getDietLogs(),
  });
  const latestDiet = dietData?.dietLogs?.[0];
  const [formState, setFormState] = useState({
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    waterLiters: "",
  });

  useEffect(() => {
    if (!latestDiet) return;
    setFormState({
      calories: latestDiet.calories ? String(latestDiet.calories) : "",
      proteinG: latestDiet.proteinG ? String(latestDiet.proteinG) : "",
      carbsG: latestDiet.carbsG ? String(latestDiet.carbsG) : "",
      fatG: latestDiet.fatG ? String(latestDiet.fatG) : "",
      waterLiters: latestDiet.waterLiters ? String(latestDiet.waterLiters) : "",
    });
  }, [latestDiet]);

  const saveDietMutation = useMutation({
    mutationFn: () =>
      api.createDietLog({
        calories: formState.calories ? Number(formState.calories) : undefined,
        proteinG: formState.proteinG ? Number(formState.proteinG) : undefined,
        carbsG: formState.carbsG ? Number(formState.carbsG) : undefined,
        fatG: formState.fatG ? Number(formState.fatG) : undefined,
        waterLiters: formState.waterLiters ? Number(formState.waterLiters) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietLogs"] });
    },
  });

  const regenerateDietPlan = useMutation({
    mutationFn: () => api.regenerateDietPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietPlan"] });
      setCustomPlan(null);
      setMealAdjustments({});
    },
  });

  const dietPlanRaw = dietPlanData?.plan ?? fallbackDietPlan;
  const dietPlan = {
    ...dietPlanRaw,
    meals: (dietPlanRaw.meals || []).map((meal) => {
      if ("options" in meal && Array.isArray((meal as { options?: unknown }).options)) {
        return meal;
      }
      const legacyMeal = meal as {
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
        calories: legacyMeal.calories || 0,
        protein: legacyMeal.protein || 0,
        carbs: legacyMeal.carbs || 0,
        fat: legacyMeal.fat || 0,
        foods: legacyMeal.foods || [],
      };
      return {
        name: legacyMeal.name,
        time: legacyMeal.time,
        options: [
          baseOption,
          { ...baseOption, label: "Opcao 2" },
          { ...baseOption, label: "Opcao 3" },
        ],
      };
    }),
  };
  const activePlan = customPlan ?? dietPlan;

  const consumedCalories = latestDiet?.calories || 0;
  const consumedProtein = latestDiet?.proteinG || 0;
  const consumedCarbs = latestDiet?.carbsG || 0;
  const consumedFat = latestDiet?.fatG || 0;
  const consumedWater = latestDiet?.waterLiters || 0;

  const caloriesProgress = (consumedCalories / activePlan.totalCalories) * 100;
  const proteinProgress = (consumedProtein / activePlan.protein.target) * 100;
  const carbsProgress = (consumedCarbs / activePlan.carbs.target) * 100;
  const fatProgress = (consumedFat / activePlan.fat.target) * 100;
  const waterProgress = (consumedWater / activePlan.water.target) * 100;

  const handleAdjustMeal = async (mealIndex: number) => {
    const meal = activePlan.meals[mealIndex];
    const state = mealAdjustments[mealIndex];
    if (!meal || !state?.availableFoods) return;

    setMealAdjustments((prev) => ({
      ...prev,
      [mealIndex]: { ...state, isLoading: true, error: undefined },
    }));

    try {
      const response = await api.adjustDietMeal({
        mealName: meal.name,
        mealTime: meal.time,
        availableFoods: state.availableFoods,
        planTargets: {
          totalCalories: activePlan.totalCalories,
          protein: activePlan.protein,
          carbs: activePlan.carbs,
          fat: activePlan.fat,
        },
        optionMacros: {
          calories: meal.options[0]?.calories || 0,
          protein: meal.options[0]?.protein || 0,
          carbs: meal.options[0]?.carbs || 0,
          fat: meal.options[0]?.fat || 0,
        },
        photo: state.photo,
      });

      setMealAdjustments((prev) => ({
        ...prev,
        [mealIndex]: { ...state, isLoading: false, suggestion: response },
      }));
    } catch (error) {
      setMealAdjustments((prev) => ({
        ...prev,
        [mealIndex]: {
          ...state,
          isLoading: false,
          error: "Nao foi possivel gerar a opcao agora.",
        },
      }));
    }
  };

  const applySuggestion = (mealIndex: number) => {
    const suggestion = mealAdjustments[mealIndex]?.suggestion;
    if (!suggestion) return;
    const updated = activePlan.meals.map((meal, index) => {
      if (index !== mealIndex) return meal;
      const updatedOptions = [...meal.options];
      const label = "Opcao Ajustada";
      const newOption = { ...suggestion.option, label };
      if (updatedOptions.length >= 3) {
        updatedOptions[2] = newOption;
      } else {
        updatedOptions.push(newOption);
      }
      return { ...meal, options: updatedOptions };
    });
    setCustomPlan({ ...activePlan, meals: updated });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="DIETA" subtitle="Seu plano alimentar personalizado" />

      <main className="px-4 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-card to-secondary border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground tracking-wide">
              REGISTRAR CONSUMO
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadDietPlanPdf(activePlan)}
              >
                Baixar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateDietPlan.mutate()}
                disabled={regenerateDietPlan.isPending}
              >
                {regenerateDietPlan.isPending ? "Atualizando..." : "Atualizar plano"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Kcal"
              value={formState.calories}
              onChange={(e) => setFormState((prev) => ({ ...prev, calories: e.target.value }))}
            />
            <Input
              placeholder="Proteina (g)"
              value={formState.proteinG}
              onChange={(e) => setFormState((prev) => ({ ...prev, proteinG: e.target.value }))}
            />
            <Input
              placeholder="Carbo (g)"
              value={formState.carbsG}
              onChange={(e) => setFormState((prev) => ({ ...prev, carbsG: e.target.value }))}
            />
            <Input
              placeholder="Gordura (g)"
              value={formState.fatG}
              onChange={(e) => setFormState((prev) => ({ ...prev, fatG: e.target.value }))}
            />
            <Input
              placeholder="Agua (L)"
              value={formState.waterLiters}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, waterLiters: e.target.value }))
              }
            />
          </div>
          <Button
            variant="fitness"
            className="w-full mt-4"
            onClick={() => saveDietMutation.mutate()}
            disabled={saveDietMutation.isPending}
          >
            {saveDietMutation.isPending ? "Salvando..." : "Salvar consumo do dia"}
          </Button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-card to-secondary border border-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-display text-xl text-foreground tracking-wide mb-1">
                CALORIAS HOJE
              </h2>
              <p className="text-3xl font-bold text-foreground">
                {consumedCalories}
                <span className="text-lg text-muted-foreground font-normal">
                  {" "}
                  / {activePlan.totalCalories} kcal
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Faltam {activePlan.totalCalories - consumedCalories} kcal
              </p>
            </div>
            <ProgressRing progress={caloriesProgress} size={90} />
          </div>
        </motion.section>

        <section className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-card border border-border text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 mx-auto flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Proteina</p>
            <p className="font-bold text-foreground">
              {consumedProtein}
              <span className="text-xs text-muted-foreground">
                /{activePlan.protein.target}g
              </span>
            </p>
            <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(proteinProgress, 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-2xl bg-card border border-border text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-warning/10 mx-auto flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground">Carbos</p>
            <p className="font-bold text-foreground">
              {consumedCarbs}
              <span className="text-xs text-muted-foreground">
                /{activePlan.carbs.target}g
              </span>
            </p>
            <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all"
                style={{ width: `${Math.min(carbsProgress, 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-card border border-border text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-destructive/10 mx-auto flex items-center justify-center mb-2">
              <Droplets className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground">Gordura</p>
            <p className="font-bold text-foreground">
              {consumedFat}
              <span className="text-xs text-muted-foreground">
                /{activePlan.fat.target}g
              </span>
            </p>
            <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-destructive rounded-full transition-all"
                style={{ width: `${Math.min(fatProgress, 100)}%` }}
              />
            </div>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Hidratacao</p>
                <p className="text-xs text-muted-foreground">
                  {consumedWater}L de {activePlan.water.target}L
                </p>
              </div>
            </div>
            <span className="text-primary font-bold">{Math.round(waterProgress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(waterProgress, 100)}%` }}
            />
          </div>
        </motion.section>

        <section>
          <h2 className="font-display text-xl text-foreground tracking-wide mb-4">
            REFEICOES DO DIA
          </h2>
          {isDietPlanLoading && (
            <p className="text-sm text-muted-foreground">Gerando seu plano com IA...</p>
          )}
          <div className="space-y-4">
            {activePlan.meals.map((meal, index) => {
              const adjustment = mealAdjustments[index] || {
                isOpen: false,
                availableFoods: "",
              };
              return (
                <div key={index} className="space-y-3">
                  <MealCard {...meal} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMealAdjustments((prev) => ({
                        ...prev,
                        [index]: { ...adjustment, isOpen: !adjustment.isOpen },
                      }))
                    }
                  >
                    {adjustment.isOpen ? "Fechar ajuste" : "Nao tenho esses alimentos"}
                  </Button>
                  {adjustment.isOpen && (
                    <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          Quais alimentos voce tem disponivel?
                        </label>
                        <Textarea
                          className="mt-2"
                          placeholder="Ex: frango, arroz, banana, iogurte..."
                          value={adjustment.availableFoods}
                          onChange={(event) =>
                            setMealAdjustments((prev) => ({
                              ...prev,
                              [index]: { ...adjustment, availableFoods: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          Envie uma foto dos alimentos (opcional)
                        </label>
                        <Input
                          className="mt-2"
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            setMealAdjustments((prev) => ({
                              ...prev,
                              [index]: {
                                ...adjustment,
                                photo: event.target.files?.[0] || null,
                              },
                            }))
                          }
                        />
                      </div>
                      <Button
                        variant="fitness"
                        size="sm"
                        onClick={() => handleAdjustMeal(index)}
                        disabled={adjustment.isLoading}
                      >
                        {adjustment.isLoading ? "Gerando..." : "Gerar alternativa"}
                      </Button>
                      {adjustment.error && (
                        <p className="text-sm text-destructive">{adjustment.error}</p>
                      )}
                      {adjustment.suggestion && (
                        <div className="space-y-2 rounded-xl border border-border bg-secondary/40 p-3">
                          <p className="text-sm text-foreground font-medium">
                            Opcao sugerida
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {adjustment.suggestion.reasoning}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {adjustment.suggestion.option.foods.join(", ")}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applySuggestion(index)}
                          >
                            Aplicar ao plano de hoje
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <ChatBox page="diet" />
      </main>

      <BottomNav />
    </div>
  );
};

export default Diet;
