import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ProgressRing } from "@/components/ProgressRing";
import { BottomNav } from "@/components/BottomNav";
import { ChatBox } from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });
  const { data: measurementsData } = useQuery({
    queryKey: ["measurements"],
    queryFn: () => api.getMeasurements(),
  });
  const { data: dietData } = useQuery({
    queryKey: ["dietLogs"],
    queryFn: () => api.getDietLogs(),
  });
  const { data: workoutsData } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => api.getWorkouts(),
  });
  const { data: analysesData } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => api.getAnalyses(),
  });
  const { data: exercisesData } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => api.getExercises(),
  });

  const profile = profileData?.profile;
  const latestMeasurement = measurementsData?.measurements?.[0];
  const latestDiet = dietData?.dietLogs?.[0];
  const latestAnalysis = analysesData?.analyses?.[0];
  const exercises = exercisesData?.exercises?.length
    ? exercisesData.exercises.slice(0, 3).map((exercise) => ({
        name: exercise.name,
        sets: 3,
        reps: "10-12",
        muscleGroup: exercise.muscleGroup || "Geral",
        duration: "12 min",
        calories: 80,
      }))
    : mockExercises;

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 6);
  const workoutsThisWeek = workoutsData?.workouts?.filter((workout) => {
    const date = new Date(workout.date);
    return date >= startOfWeek;
  }).length;
  const weeklyTarget = profile?.trainingDays || 5;
  const caloriesTarget = 2500;
  const caloriesConsumed = latestDiet?.calories || 0;
  const progressPercent = Math.min((caloriesConsumed / caloriesTarget) * 100, 100);
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
    : "AI";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with greeting */}
      <PageHeader
        title="FALA, GUERREIRO!"
        subtitle="Hora de evoluir mais um dia"
        rightElement={
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold text-lg">
            {initials}
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
                    {caloriesConsumed} / {caloriesTarget} kcal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {workoutsThisWeek || 0} de {weeklyTarget} treinos
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
            <ProgressRing progress={progressPercent} size={100} label="Completo" />
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
              value={latestMeasurement?.weightKg || 0}
              unit="kg"
              trend="down"
              trendValue="1.2kg"
            />
            <StatCard
              icon={Target}
              label="Meta Semanal"
              value={weeklyTarget}
              unit="treinos"
              trend="neutral"
              trendValue={profile?.goal || "Defina sua meta"}
            />
            <StatCard
              icon={TrendingUp}
              label="% Gordura"
              value={latestAnalysis?.bodyFatEstimate || latestMeasurement?.bodyFatPct || 0}
              unit="%"
              trend="down"
              trendValue="0.8%"
            />
            <StatCard
              icon={Flame}
              label="Kcal Hoje"
              value={caloriesConsumed}
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
            {exercises.map((exercise, index) => (
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
            <div className="flex gap-3">
              <Button variant="fitness" onClick={() => navigate("/analysis")}>
                Enviar Fotos
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile/setup")}>
                Completar Dados Pessoais
              </Button>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        </motion.section>

        <ChatBox page="home" />
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
