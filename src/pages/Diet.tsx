import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { ProgressRing } from "@/components/ProgressRing";
import { motion } from "framer-motion";
import { Flame, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type DietAdjustment } from "@/lib/api";

const fallbackDietPlan = {
  totalCalories: 2500,
  protein: { target: 180 },
  carbs: { target: 280 },
  fat: { target: 70 },
  water: { target: 3 },
  meals: [
    {
      name: "Café da Manhã",
      time: "07:00",
      calories: 520,
      protein: 35,
      carbs: 55,
      fat: 18,
      foods: ["4 ovos mexidos", "2 fatias pão integral", "1 banana", "Café preto"],
      isCompleted: true,
    },
    {
      name: "Lanche da Manhã",
      time: "10:00",
      calories: 280,
      protein: 28,
      carbs: 25,
      fat: 8,
      foods: ["Shake de whey", "1 maçã", "30g amendoim"],
      isCompleted: true,
    },
    {
      name: "Almoço",
      time: "12:30",
      calories: 680,
      protein: 45,
      carbs: 70,
      fat: 18,
      foods: ["200g frango grelhado", "150g arroz integral", "Salada verde", "Legumes"],
      isCompleted: true,
    },
    {
      name: "Pré-Treino",
      time: "15:30",
      calories: 370,
      protein: 27,
      carbs: 45,
      fat: 8,
      foods: ["Batata doce", "150g peito de frango", "Suco natural"],
      isCompleted: false,
    },
    {
      name: "Pós-Treino",
      time: "18:00",
      calories: 320,
      protein: 35,
      carbs: 40,
      fat: 5,
      foods: ["Whey protein", "1 banana", "Maltodextrina"],
      isCompleted: false,
    },
    {
      name: "Jantar",
      time: "20:00",
      calories: 530,
      protein: 40,
      carbs: 45,
      fat: 20,
      foods: ["200g carne", "Purê de batata", "Brócolis", "Azeite"],
      isCompleted: false,
    },
  ],
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  adjustment?: DietAdjustment;
};

const Diet = () => {
  const queryClient = useQueryClient();
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
  const [chatInput, setChatInput] = useState("");
  const [availableFoods, setAvailableFoods] = useState("");
  const [foodPhoto, setFoodPhoto] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAdjusting, setIsAdjusting] = useState(false);

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
    },
  });

  const dietPlan = dietPlanData?.plan ?? fallbackDietPlan;

  const consumedCalories = latestDiet?.calories || 0;
  const consumedProtein = latestDiet?.proteinG || 0;
  const consumedCarbs = latestDiet?.carbsG || 0;
  const consumedFat = latestDiet?.fatG || 0;
  const consumedWater = latestDiet?.waterLiters || 0;

  const caloriesProgress = (consumedCalories / dietPlan.totalCalories) * 100;
  const proteinProgress = (consumedProtein / dietPlan.protein.target) * 100;
  const carbsProgress = (consumedCarbs / dietPlan.carbs.target) * 100;
  const fatProgress = (consumedFat / dietPlan.fat.target) * 100;
  const waterProgress = (consumedWater / dietPlan.water.target) * 100;
  const fiberTarget = Math.round((dietPlan.totalCalories / 1000) * 14);
  const remainingTargets = {
    calories: Math.max(dietPlan.totalCalories - consumedCalories, 0),
    proteinG: Math.max(dietPlan.protein.target - consumedProtein, 0),
    carbsG: Math.max(dietPlan.carbs.target - consumedCarbs, 0),
    fatG: Math.max(dietPlan.fat.target - consumedFat, 0),
    fiberG: fiberTarget,
  };

  const handleAdjustDiet = async () => {
    const messageText = chatInput.trim();
    const foodsText = availableFoods.trim();
    if (!messageText && !foodsText && !foodPhoto) return;

    const userContent = [
      messageText ||
        "Ajuste a dieta com os alimentos disponíveis para manter as metas do dia.",
      foodsText ? `Alimentos disponíveis: ${foodsText}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    setChatMessages((prev) => [...prev, { role: "user", content: userContent }]);
    setIsAdjusting(true);
    try {
      const result = await api.adjustDiet({
        message: messageText || "Ajuste a dieta conforme metas.",
        availableFoods: foodsText || undefined,
        targetMacros: remainingTargets,
        photo: foodPhoto || undefined,
      });
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.adjustment.response,
          adjustment: result.adjustment,
        },
      ]);
      setChatInput("");
      setFoodPhoto(null);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Não consegui ajustar a dieta agora. Tente novamente.",
        },
      ]);
    } finally {
      setIsAdjusting(false);
    }
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => regenerateDietPlan.mutate()}
              disabled={regenerateDietPlan.isPending}
            >
              {regenerateDietPlan.isPending ? "Atualizando..." : "Atualizar plano"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Kcal"
              value={formState.calories}
              onChange={(e) => setFormState((prev) => ({ ...prev, calories: e.target.value }))}
            />
            <Input
              placeholder="Proteína (g)"
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
              placeholder="Água (L)"
              value={formState.waterLiters}
              onChange={(e) => setFormState((prev) => ({ ...prev, waterLiters: e.target.value }))}
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
                  / {dietPlan.totalCalories} kcal
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Faltam {dietPlan.totalCalories - consumedCalories} kcal
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
            <p className="text-xs text-muted-foreground">Proteína</p>
            <p className="font-bold text-foreground">
              {consumedProtein}
              <span className="text-xs text-muted-foreground">/{dietPlan.protein.target}g</span>
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
              <span className="text-xs text-muted-foreground">/{dietPlan.carbs.target}g</span>
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
              <span className="text-xs text-muted-foreground">/{dietPlan.fat.target}g</span>
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
                <p className="font-semibold text-foreground">Hidratação</p>
                <p className="text-xs text-muted-foreground">
                  {consumedWater}L de {dietPlan.water.target}L
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
            REFEIÇÕES DO DIA
          </h2>
          {isDietPlanLoading && (
            <p className="text-sm text-muted-foreground">Gerando seu plano com IA...</p>
          )}
          <div className="space-y-4">
            {dietPlan.meals.map((meal, index) => (
              <MealCard key={index} {...meal} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground tracking-wide">
              AJUSTAR DIETA COM IA
            </h2>
            <span className="text-xs text-muted-foreground">
              Metas restantes: {remainingTargets.calories} kcal
            </span>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Descreva o que você tem para comer ou o que deseja substituir."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  rows={3}
                />
                <Input
                  placeholder="Lista de alimentos disponíveis (opcional)"
                  value={availableFoods}
                  onChange={(e) => setAvailableFoods(e.target.value)}
                />
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFoodPhoto(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Envie uma foto do alimento para ajudar nos cálculos.
                  </p>
                </div>
                <Button
                  variant="fitness"
                  className="w-full"
                  onClick={handleAdjustDiet}
                  disabled={isAdjusting}
                >
                  {isAdjusting ? "Calculando..." : "Gerar ajuste"}
                </Button>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Converse com o agente para adaptar sua dieta sem perder as metas.
                  </p>
                )}
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-3 text-sm ${
                      message.role === "user"
                        ? "bg-primary/10 text-foreground ml-6"
                        : "bg-secondary text-foreground mr-6"
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.adjustment && (
                      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                        <div className="grid grid-cols-2 gap-2">
                          {message.adjustment.items.map((item) => (
                            <div key={`${item.name}-${item.quantity}`} className="rounded-lg bg-background p-2">
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p>{item.quantity}</p>
                              <p>
                                {item.calories} kcal | P {item.proteinG}g C {item.carbsG}g G {item.fatG}g F {item.fiberG}g
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg bg-background p-2">
                          <p className="font-semibold text-foreground">Totais</p>
                          <p>
                            {message.adjustment.totals.calories} kcal | P {message.adjustment.totals.proteinG}g C{" "}
                            {message.adjustment.totals.carbsG}g G {message.adjustment.totals.fatG}g F{" "}
                            {message.adjustment.totals.fiberG}g
                          </p>
                        </div>
                        {message.adjustment.assumptions?.length ? (
                          <div className="rounded-lg bg-background p-2">
                            <p className="font-semibold text-foreground">Observações</p>
                            <ul className="list-disc pl-4 space-y-1">
                              {message.adjustment.assumptions.map((assumption) => (
                                <li key={assumption}>{assumption}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Diet;
