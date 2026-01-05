import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ProgressRing } from "@/components/ProgressRing";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Target,
  Flame,
  Dumbbell,
  TrendingUp,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockExercises = [
  {
    name: "Supino Reto com Barra",
    sets: 4,
    reps: "8-10",
    muscleGroup: "Peito",
    duration: "15 min",
    calories: 120,
  },
  {
    name: "Crucifixo Inclinado",
    sets: 3,
    reps: "12",
    muscleGroup: "Peito Superior",
    duration: "10 min",
    calories: 80,
  },
  {
    name: "Tríceps Pulley",
    sets: 4,
    reps: "12-15",
    muscleGroup: "Tríceps",
    duration: "12 min",
    calories: 90,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with greeting */}
      <PageHeader
        title="FALA, GUERREIRO!"
        subtitle="Hoje é dia de peito e tríceps"
        rightElement={
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold text-lg">
            JD
          </div>
        }
      />

      {/* Main content */}
      <main className="px-4 space-y-6">
        {/* Daily progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-card to-secondary border border-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-display text-xl text-foreground tracking-wide mb-2">
                PROGRESSO DIÁRIO
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-warning" />
                  <span className="text-sm text-muted-foreground">
                    1.850 / 2.500 kcal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    2 de 5 exercícios
                  </span>
                </div>
              </div>
              <Button
                variant="fitness"
                size="sm"
                className="mt-4"
                onClick={() => navigate("/workout")}
              >
                <Zap className="h-4 w-4" />
                Continuar Treino
              </Button>
            </div>
            <ProgressRing progress={65} size={100} label="Completo" />
          </div>
        </motion.section>

        {/* Stats grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground tracking-wide">
              SEUS STATS
            </h2>
            <button className="text-primary text-sm font-medium flex items-center gap-1">
              Ver mais <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Scale}
              label="Peso Atual"
              value={78.5}
              unit="kg"
              trend="down"
              trendValue="1.2kg"
            />
            <StatCard
              icon={Target}
              label="Meta"
              value={75}
              unit="kg"
              trend="neutral"
              trendValue="3.5kg"
            />
            <StatCard
              icon={TrendingUp}
              label="% Gordura"
              value={18.2}
              unit="%"
              trend="down"
              trendValue="0.8%"
            />
            <StatCard
              icon={Flame}
              label="Kcal Hoje"
              value={1850}
              unit=""
              trend="up"
              trendValue="+350"
            />
          </div>
        </section>

        {/* Today's workout */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground tracking-wide">
              TREINO DE HOJE
            </h2>
            <button
              onClick={() => navigate("/workout")}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              Ver tudo <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {mockExercises.map((exercise, index) => (
              <ExerciseCard
                key={index}
                {...exercise}
                isCompleted={index < 2}
                onClick={() => navigate("/workout")}
              />
            ))}
          </div>
        </section>

        {/* Body analysis CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30"
        >
          <div className="relative z-10">
            <h3 className="font-display text-xl text-foreground mb-2">
              ANÁLISE CORPORAL
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Atualize suas fotos para uma avaliação precisa da IA
            </p>
            <Button variant="fitness" onClick={() => navigate("/analysis")}>
              Enviar Fotos
            </Button>
          </div>
          <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
