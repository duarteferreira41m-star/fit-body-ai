import { PageHeader } from "@/components/PageHeader";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";
import { ProgressRing } from "@/components/ProgressRing";
import { motion } from "framer-motion";
import { Flame, Droplets, Zap } from "lucide-react";

const dietPlan = {
  totalCalories: 2500,
  consumedCalories: 1850,
  protein: { target: 180, consumed: 135 },
  carbs: { target: 280, consumed: 195 },
  fat: { target: 70, consumed: 52 },
  water: { target: 3, consumed: 2.1 },
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
      foods: ["200g frango grelhado", "150g arroz integral", "Salada verde", "Legumes refogados"],
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
      foods: ["200g carne vermelha", "Purê de batata", "Brócolis", "Azeite"],
      isCompleted: false,
    },
  ],
};

const Diet = () => {
  const caloriesProgress = (dietPlan.consumedCalories / dietPlan.totalCalories) * 100;
  const proteinProgress = (dietPlan.protein.consumed / dietPlan.protein.target) * 100;
  const carbsProgress = (dietPlan.carbs.consumed / dietPlan.carbs.target) * 100;
  const fatProgress = (dietPlan.fat.consumed / dietPlan.fat.target) * 100;
  const waterProgress = (dietPlan.water.consumed / dietPlan.water.target) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="DIETA" subtitle="Seu plano alimentar personalizado" />

      <main className="px-4 space-y-6">
        {/* Calories summary */}
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
                {dietPlan.consumedCalories}
                <span className="text-lg text-muted-foreground font-normal">
                  {" "}
                  / {dietPlan.totalCalories} kcal
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Faltam {dietPlan.totalCalories - dietPlan.consumedCalories} kcal
              </p>
            </div>
            <ProgressRing progress={caloriesProgress} size={90} />
          </div>
        </motion.section>

        {/* Macros */}
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
              {dietPlan.protein.consumed}
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
              {dietPlan.carbs.consumed}
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
              {dietPlan.fat.consumed}
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

        {/* Water intake */}
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
                  {dietPlan.water.consumed}L de {dietPlan.water.target}L
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

        {/* Meals */}
        <section>
          <h2 className="font-display text-xl text-foreground tracking-wide mb-4">
            REFEIÇÕES DO DIA
          </h2>
          <div className="space-y-4">
            {dietPlan.meals.map((meal, index) => (
              <MealCard key={index} {...meal} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Diet;
