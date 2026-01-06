import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { ExerciseCard } from "@/components/ExerciseCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Play,
  SkipForward,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const fallbackWorkoutPlan = {
  name: "Peito e Triceps",
  durationMin: 60,
  calories: 450,
  exercises: [
    {
      name: "Supino Reto com Barra",
      sets: 4,
      reps: "8-10",
      muscleGroup: "Peito",
      rest: "90s",
      instructions: [
        "Deite no banco com os pés apoiados no chão",
        "Segure a barra com pegada um pouco maior que a largura dos ombros",
        "Desça a barra controladamente até o peito",
        "Empurre a barra para cima até os braços estenderem",
      ],
    },
    {
      name: "Supino Inclinado Halteres",
      sets: 4,
      reps: "10-12",
      muscleGroup: "Peito Superior",
      rest: "60s",
      instructions: [
        "Ajuste o banco em 30-45 graus",
        "Segure os halteres na altura do peito",
        "Empurre para cima juntando os halteres no topo",
        "Desça controladamente",
      ],
    },
    {
      name: "Crucifixo Maquina",
      sets: 3,
      reps: "12-15",
      muscleGroup: "Peito",
      rest: "45s",
      instructions: [
        "Ajuste o banco e pegadores na altura do peito",
        "Junte os braços à frente do corpo",
        "Retorne controladamente à posição inicial",
      ],
    },
    {
      name: "Triceps Pulley Corda",
      sets: 4,
      reps: "12-15",
      muscleGroup: "Triceps",
      rest: "45s",
      instructions: [
        "Segure a corda com as palmas voltadas uma para outra",
        "Mantenha os cotovelos junto ao corpo",
        "Estenda os braços separando a corda no final",
        "Retorne controladamente",
      ],
    },
    {
      name: "Triceps Frances",
      sets: 3,
      reps: "10-12",
      muscleGroup: "Triceps",
      rest: "60s",
      instructions: [
        "Deite no banco segurando a barra EZ",
        "Desça a barra em direção à testa",
        "Estenda os cotovelos para retornar",
      ],
    },
  ],
};

const getYoutubeId = (url?: string | null) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
  } catch (error) {
    return null;
  }
  return null;
};

const Workout = () => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [restTime, setRestTime] = useState(0);
  const [workoutSaved, setWorkoutSaved] = useState(false);

  const { data: workoutPlanData, isLoading: isWorkoutPlanLoading } = useQuery({
    queryKey: ["workoutPlan"],
    queryFn: () => api.getWorkoutPlan(),
  });
  const { data: exercisesData } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => api.getExercises(),
  });

  const regenerateWorkoutPlan = useMutation({
    mutationFn: () => api.regenerateWorkoutPlan(),
    onSuccess: () => {
      setCurrentExerciseIndex(0);
      setCompletedExercises([]);
      setWorkoutSaved(false);
    },
  });

  const workoutPlan = workoutPlanData?.plan ?? fallbackWorkoutPlan;

  const saveWorkoutMutation = useMutation({
    mutationFn: () =>
      api.createWorkout({
        name: workoutPlan.name,
        durationMin: workoutPlan.durationMin,
        calories: workoutPlan.calories,
      }),
    onSuccess: () => {
      setWorkoutSaved(true);
    },
  });

  const youtubeMap = useMemo(() => {
    const map = new Map<string, string>();
    exercisesData?.exercises?.forEach((exercise) => {
      if (exercise.youtubeUrl) {
        const id = getYoutubeId(exercise.youtubeUrl);
        if (id) {
          map.set(exercise.name, id);
        }
      }
    });
    return map;
  }, [exercisesData?.exercises]);

  const currentExercise = workoutPlan.exercises[currentExerciseIndex];
  const youtubeId = youtubeMap.get(currentExercise.name);

  const handleCompleteSet = () => {
    setIsResting(true);
    setRestTime(parseInt(currentExercise.rest) || 60);
    const timer = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCompleteExercise = () => {
    if (!completedExercises.includes(currentExerciseIndex)) {
      setCompletedExercises([...completedExercises, currentExerciseIndex]);
    }
    if (currentExerciseIndex < workoutPlan.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < workoutPlan.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const progress = (completedExercises.length / workoutPlan.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title="TREINO"
        subtitle={workoutPlan.name}
        rightElement={
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateWorkoutPlan.mutate()}
            disabled={regenerateWorkoutPlan.isPending}
          >
            {regenerateWorkoutPlan.isPending ? "Atualizando..." : "Atualizar plano"}
          </Button>
        }
      />

      <main className="px-4 space-y-6">
        {isWorkoutPlanLoading && (
          <p className="text-sm text-muted-foreground">Gerando seu treino com IA...</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-primary font-medium">
              {completedExercises.length}/{workoutPlan.exercises.length}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {isResting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <div className="text-center">
                <Clock className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="font-display text-4xl text-foreground mb-2">DESCANSE</h2>
                <motion.p
                  key={restTime}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-bold text-primary"
                >
                  {restTime}s
                </motion.p>
                <p className="text-muted-foreground mt-4">Próximo: {currentExercise.name}</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setIsResting(false);
                    setRestTime(0);
                  }}
                >
                  Pular Descanso
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center relative">
            {youtubeId ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={currentExercise.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-10 w-10 text-primary ml-1" />
                </div>
              </div>
            )}
            <p className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/50 backdrop-blur-sm px-2 py-1 rounded">
              Toque para ver demonstração
            </p>
          </div>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-2xl text-foreground">{currentExercise.name}</h3>
                <p className="text-sm text-muted-foreground">{currentExercise.muscleGroup}</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-bold">
                  {currentExercise.sets} x {currentExercise.reps}
                </p>
                <p className="text-xs text-muted-foreground">Descanso: {currentExercise.rest}</p>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground"
            >
              <span>Instruções de execução</span>
              {showInstructions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ol className="space-y-2 py-3 border-t border-border">
                    {currentExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-4">
              <Button variant="secondary" size="lg" className="flex-1" onClick={handleSkipExercise}>
                <SkipForward className="h-5 w-5" />
                Pular
              </Button>
              <Button variant="fitness" size="lg" className="flex-1" onClick={handleCompleteSet}>
                <Check className="h-5 w-5" />
                Série Feita
              </Button>
            </div>
            <Button
              variant="default"
              size="lg"
              className="w-full mt-3"
              onClick={handleCompleteExercise}
            >
              Concluir Exercício
            </Button>
          </CardContent>
        </Card>

        <section>
          <h3 className="font-display text-lg text-foreground mb-3">TODOS OS EXERCÍCIOS</h3>
          <div className="space-y-3">
            {workoutPlan.exercises.map((exercise, index) => (
              <ExerciseCard
                key={index}
                name={exercise.name}
                sets={exercise.sets}
                reps={exercise.reps}
                muscleGroup={exercise.muscleGroup}
                isCompleted={completedExercises.includes(index)}
                onClick={() => setCurrentExerciseIndex(index)}
                className={index === currentExerciseIndex ? "border-primary" : ""}
              />
            ))}
          </div>
        </section>

        {completedExercises.length === workoutPlan.exercises.length && (
          <Button
            variant="fitness"
            size="lg"
            className="w-full"
            onClick={() => saveWorkoutMutation.mutate()}
            disabled={saveWorkoutMutation.isPending || workoutSaved}
          >
            {workoutSaved ? "Treino salvo" : saveWorkoutMutation.isPending ? "Salvando..." : "Finalizar treino"}
          </Button>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Workout;
