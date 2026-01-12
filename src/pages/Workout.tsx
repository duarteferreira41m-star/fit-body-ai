import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { ExerciseCard } from "@/components/ExerciseCard";
import { BottomNav } from "@/components/BottomNav";
import { ChatBox } from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { downloadWorkoutPlanPdf } from "@/lib/pdf";
import type { WorkoutPlan } from "@/lib/api";
import {
  Play,
  SkipForward,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const fallbackWorkoutPlan = {
  workouts: [
    {
      day: 1,
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
            "Deite no banco com os pes apoiados no chao",
            "Segure a barra com pegada um pouco maior que a largura dos ombros",
            "Desca a barra controladamente ate o peito",
            "Empurre a barra para cima ate os bracos estenderem",
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
            "Desca controladamente",
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
            "Junte os bracos a frente do corpo",
            "Retorne controladamente a posicao inicial",
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
            "Estenda os bracos separando a corda no final",
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
            "Desca a barra em direcao a testa",
            "Estenda os cotovelos para retornar",
          ],
        },
      ],
    },
    {
      day: 2,
      name: "Costas e Biceps",
      durationMin: 55,
      calories: 420,
      exercises: [
        {
          name: "Puxada na Barra",
          sets: 4,
          reps: "8-10",
          muscleGroup: "Costas",
          rest: "90s",
          instructions: [
            "Ajuste o banco e segure a barra com pegada aberta",
            "Puxe a barra ate o peito",
            "Controle a volta mantendo as escpulas ativas",
          ],
        },
        {
          name: "Remada Curvada",
          sets: 4,
          reps: "10-12",
          muscleGroup: "Costas",
          rest: "75s",
          instructions: [
            "Incline o tronco mantendo a coluna neutra",
            "Puxe a barra ate o abdome",
            "Retorne controladamente",
          ],
        },
        {
          name: "Rosca Direta",
          sets: 3,
          reps: "10-12",
          muscleGroup: "Biceps",
          rest: "60s",
          instructions: [
            "Mantenha os cotovelos proximos do corpo",
            "Suba a barra ate a altura do peito",
            "Desca lentamente",
          ],
        },
        {
          name: "Rosca Alternada",
          sets: 3,
          reps: "12",
          muscleGroup: "Biceps",
          rest: "45s",
          instructions: [
            "Alterne os bracos mantendo o cotovelo firme",
            "Suba o halter em supinacao",
            "Retorne controladamente",
          ],
        },
      ],
    },
    {
      day: 3,
      name: "Pernas",
      durationMin: 65,
      calories: 520,
      exercises: [
        {
          name: "Agachamento Livre",
          sets: 4,
          reps: "8-10",
          muscleGroup: "Quadriceps",
          rest: "90s",
          instructions: [
            "Posicione a barra nas costas e os pes na largura dos ombros",
            "Desca mantendo o tronco firme",
            "Suba empurrando o chao",
          ],
        },
        {
          name: "Leg Press",
          sets: 4,
          reps: "12",
          muscleGroup: "Quadriceps",
          rest: "75s",
          instructions: [
            "Apoie os pes na plataforma",
            "Flexione os joelhos ate 90 graus",
            "Estenda controladamente",
          ],
        },
        {
          name: "Stiff",
          sets: 3,
          reps: "10-12",
          muscleGroup: "Posterior",
          rest: "60s",
          instructions: [
            "Mantenha a coluna neutra",
            "Desca a barra ate alongar o posterior",
            "Suba contraindo gluteos",
          ],
        },
        {
          name: "Panturrilha em Pe",
          sets: 4,
          reps: "15-20",
          muscleGroup: "Panturrilha",
          rest: "45s",
          instructions: [
            "Suba na ponta dos pes",
            "Segure 1s no topo",
            "Desca controladamente",
          ],
        },
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
  const [customPlan, setCustomPlan] = useState<WorkoutPlan | null>(null);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedByWorkout, setCompletedByWorkout] = useState<Record<number, number[]>>({});
  const [savedByWorkout, setSavedByWorkout] = useState<Record<number, boolean>>({});
  const [isResting, setIsResting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [restTime, setRestTime] = useState(0);
  const [restOverrides, setRestOverrides] = useState<Record<string, string>>({});
  const [restSuggestion, setRestSuggestion] = useState<string | null>(null);
  const [restReasoning, setRestReasoning] = useState<string | null>(null);
  const [isRestSuggesting, setIsRestSuggesting] = useState(false);
  const [substituteReason, setSubstituteReason] = useState("");
  const [substituteSuggestion, setSubstituteSuggestion] = useState<
    | {
        substitute: WorkoutPlan["workouts"][number]["exercises"][number];
        reasoning: string;
      }
    | null
  >(null);
  const [isSubstituting, setIsSubstituting] = useState(false);

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
      setSelectedWorkoutIndex(0);
      setCurrentExerciseIndex(0);
      setCompletedByWorkout({});
      setSavedByWorkout({});
      setCustomPlan(null);
      setRestOverrides({});
      setRestSuggestion(null);
      setRestReasoning(null);
      setSubstituteSuggestion(null);
      setSubstituteReason("");
    },
  });

  const workoutPlan = workoutPlanData?.plan ?? fallbackWorkoutPlan;
  const activePlan = customPlan ?? workoutPlan;
  const legacyWorkoutPlan = activePlan as {
    name?: string;
    durationMin?: number;
    calories?: number;
    exercises?: {
      name: string;
      sets: number;
      reps: string;
      muscleGroup: string;
      rest: string;
      instructions: string[];
    }[];
    workouts?: typeof fallbackWorkoutPlan.workouts;
  };
  const workouts = Array.isArray((activePlan as { workouts?: unknown }).workouts)
    ? (activePlan as { workouts: typeof fallbackWorkoutPlan.workouts }).workouts
    : legacyWorkoutPlan?.name
      ? [
          {
            day: 1,
            name: legacyWorkoutPlan.name,
            durationMin: legacyWorkoutPlan.durationMin,
            calories: legacyWorkoutPlan.calories,
            exercises: legacyWorkoutPlan.exercises || [],
          },
        ]
      : [];
  const selectedWorkout = workouts[selectedWorkoutIndex] || workouts[0];
  const exercises = selectedWorkout?.exercises || [];
  const completedExercises = completedByWorkout[selectedWorkoutIndex] || [];
  const workoutSaved = savedByWorkout[selectedWorkoutIndex] || false;

  useEffect(() => {
    setCurrentExerciseIndex(0);
    setIsResting(false);
    setRestTime(0);
    setRestSuggestion(null);
    setRestReasoning(null);
    setSubstituteSuggestion(null);
    setSubstituteReason("");
  }, [selectedWorkoutIndex, workoutPlanData?.plan]);

  const saveWorkoutMutation = useMutation({
    mutationFn: () =>
      api.createWorkout({
        name: selectedWorkout?.name || "Treino",
        durationMin: selectedWorkout?.durationMin,
        calories: selectedWorkout?.calories,
      }),
    onSuccess: () => {
      setSavedByWorkout((prev) => ({ ...prev, [selectedWorkoutIndex]: true }));
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

  const currentExercise = exercises[currentExerciseIndex];
  const restKey = `${selectedWorkoutIndex}-${currentExerciseIndex}`;
  const currentRest = restOverrides[restKey] || currentExercise?.rest || "60s";
  const youtubeId = currentExercise ? youtubeMap.get(currentExercise.name) : null;

  const handleCompleteSet = () => {
    if (!currentExercise) return;
    setIsResting(true);
    setRestTime(parseInt(currentRest, 10) || 60);
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
    if (!currentExercise) return;
    if (!completedExercises.includes(currentExerciseIndex)) {
      setCompletedByWorkout((prev) => ({
        ...prev,
        [selectedWorkoutIndex]: [...completedExercises, currentExerciseIndex],
      }));
    }
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleSuggestRest = async () => {
    if (!currentExercise) return;
    setIsRestSuggesting(true);
    try {
      const response = await api.getRestSuggestion({
        exercise: {
          name: currentExercise.name,
          muscleGroup: currentExercise.muscleGroup,
          sets: currentExercise.sets,
          reps: currentExercise.reps,
          rest: currentRest,
        },
      });
      setRestSuggestion(response.suggestedRest);
      setRestReasoning(response.reasoning);
    } catch (error) {
      setRestSuggestion(null);
      setRestReasoning("Nao foi possivel sugerir agora.");
    } finally {
      setIsRestSuggesting(false);
    }
  };

  const handleApplySubstitute = () => {
    if (!substituteSuggestion || !currentExercise) return;
    const updatedWorkouts = workouts.map((workout, workoutIndex) => {
      if (workoutIndex !== selectedWorkoutIndex) return workout;
      const updatedExercises = workout.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === currentExerciseIndex ? substituteSuggestion.substitute : exercise
      );
      return { ...workout, exercises: updatedExercises };
    });
    setCustomPlan({ workouts: updatedWorkouts });
  };

  const handleSuggestSubstitute = async () => {
    if (!currentExercise || !substituteReason.trim()) return;
    setIsSubstituting(true);
    try {
      const response = await api.getExerciseSubstitution({
        exercise: {
          name: currentExercise.name,
          muscleGroup: currentExercise.muscleGroup,
          sets: currentExercise.sets,
          reps: currentExercise.reps,
          rest: currentRest,
        },
        reason: substituteReason,
      });
      setSubstituteSuggestion(response);
    } catch (error) {
      setSubstituteSuggestion({
        substitute: {
          name: "Nao foi possivel sugerir",
          sets: currentExercise.sets,
          reps: currentExercise.reps,
          muscleGroup: currentExercise.muscleGroup,
          rest: currentRest,
          instructions: ["Tente novamente mais tarde."],
        },
        reasoning: "Nao foi possivel gerar uma substituicao agora.",
      });
    } finally {
      setIsSubstituting(false);
    }
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const progress = exercises.length
    ? (completedExercises.length / exercises.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title="TREINO"
        subtitle={selectedWorkout?.name || "Seu treino personalizado"}
        rightElement={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadWorkoutPlanPdf(activePlan)}
            >
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => regenerateWorkoutPlan.mutate()}
              disabled={regenerateWorkoutPlan.isPending}
            >
              {regenerateWorkoutPlan.isPending ? "Atualizando..." : "Atualizar plano"}
            </Button>
          </div>
        }
      />

      <main className="px-4 space-y-6">
        {isWorkoutPlanLoading && (
          <p className="text-sm text-muted-foreground">Gerando seu treino com IA...</p>
        )}

        <section>
          <h3 className="font-display text-lg text-foreground mb-3">TODOS OS TREINOS</h3>
          <div className="space-y-3">
            {workouts.map((workout, index) => {
              const label = workout.day ? `Dia ${workout.day}` : `Treino ${index + 1}`;
              return (
                <button
                  key={`${workout.name}-${index}`}
                  className="w-full text-left"
                  onClick={() => setSelectedWorkoutIndex(index)}
                >
                  <Card
                    className={cn(
                      "p-4 border border-border transition",
                      index === selectedWorkoutIndex && "border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <h4 className="font-semibold text-foreground">{workout.name}</h4>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{workout.durationMin} min</p>
                        <p>{workout.exercises.length} exercicios</p>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-primary font-medium">
              {completedExercises.length}/{exercises.length}
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
          {isResting && currentExercise && (
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
                <p className="text-muted-foreground mt-4">
                  Proximo: {currentExercise.name}
                </p>
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

        {currentExercise && (
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
                Toque para ver demonstracao
              </p>
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-2xl text-foreground">
                    {currentExercise.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentExercise.muscleGroup}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold">
                    {currentExercise.sets} x {currentExercise.reps}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Descanso: {currentRest}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground"
              >
                <span>Instrucoes de execucao</span>
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
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
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
                  Serie Feita
                </Button>
              </div>
              <Button
                variant="default"
                size="lg"
                className="w-full mt-3"
                onClick={handleCompleteExercise}
              >
                Concluir Exercicio
              </Button>
            </CardContent>
          </Card>
        )}

        {currentExercise && (
          <Card className="p-4 space-y-4 border border-border">
            <div>
              <h3 className="font-display text-lg text-foreground">Tempo de descanso</h3>
              <p className="text-sm text-muted-foreground">
                Ajuste o descanso e peça uma recomendacao tecnica da IA.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={currentRest}
                onChange={(event) =>
                  setRestOverrides((prev) => ({
                    ...prev,
                    [restKey]: event.target.value,
                  }))
                }
                placeholder="Ex: 60s"
              />
              <Button
                variant="outline"
                onClick={handleSuggestRest}
                disabled={isRestSuggesting}
              >
                {isRestSuggesting ? "Analisando..." : "Sugestao IA"}
              </Button>
            </div>
            {restSuggestion && (
              <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Sugestao: {restSuggestion}
                </p>
                {restReasoning && (
                  <p className="text-xs text-muted-foreground">{restReasoning}</p>
                )}
              </div>
            )}
          </Card>
        )}

        {currentExercise && (
          <Card className="p-4 space-y-4 border border-border">
            <div>
              <h3 className="font-display text-lg text-foreground">Substituir exercicio</h3>
              <p className="text-sm text-muted-foreground">
                Informe o desconforto ou dificuldade para receber uma alternativa tecnica.
              </p>
            </div>
            <Textarea
              value={substituteReason}
              onChange={(event) => setSubstituteReason(event.target.value)}
              placeholder="Ex: dor no ombro, falta de equipamento, carga muito alta..."
            />
            <Button
              variant="fitness"
              onClick={handleSuggestSubstitute}
              disabled={isSubstituting}
            >
              {isSubstituting ? "Gerando..." : "Gerar substituicao"}
            </Button>
            {substituteSuggestion && (
              <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Alternativa: {substituteSuggestion.substitute.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {substituteSuggestion.reasoning}
                </p>
                <p className="text-xs text-muted-foreground">
                  {substituteSuggestion.substitute.sets}x{substituteSuggestion.substitute.reps} |{" "}
                  {substituteSuggestion.substitute.rest} |{" "}
                  {substituteSuggestion.substitute.muscleGroup}
                </p>
                <Button variant="outline" size="sm" onClick={handleApplySubstitute}>
                  Aplicar ao treino de hoje
                </Button>
              </div>
            )}
          </Card>
        )}

        <section>
          <h3 className="font-display text-lg text-foreground mb-3">TODOS OS EXERCICIOS</h3>
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
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

        {exercises.length > 0 && completedExercises.length === exercises.length && (
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

        <ChatBox page="workout" />
      </main>

      <BottomNav />
    </div>
  );
};

export default Workout;
