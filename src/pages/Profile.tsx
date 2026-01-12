import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { User, Scale, Ruler, Calendar, Clock, Pill, Apple, LogOut, Edit } from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });
  const { data: measurementsData } = useQuery({
    queryKey: ["measurements"],
    queryFn: () => api.getMeasurements(),
  });
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.me(),
  });
  const updateProfileMutation = useMutation({
    mutationFn: (payload: Parameters<typeof api.updateProfile>[0]) => api.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const profile = profileData?.profile;
  const latestMeasurement = measurementsData?.measurements?.[0];
  const [formState, setFormState] = useState({
    name: "",
    age: "",
    heightCm: "",
    gender: "",
    goal: "",
    wakeUpTime: "",
    firstMealTime: "",
    trainingTime: "",
    trainingDays: "",
    trainingDurationMin: "",
    activityLevel: "",
    usesSteroids: false,
    steroids: "",
    preferredFoods: "",
    allergies: "",
  });

  useEffect(() => {
    if (!profile) return;
    setFormState({
      name: profile.name || "",
      age: profile.age ? String(profile.age) : "",
      heightCm: profile.heightCm ? String(profile.heightCm) : "",
      gender: profile.gender || "",
      goal: profile.goal || "",
      wakeUpTime: profile.wakeUpTime || "",
      firstMealTime: profile.firstMealTime || "",
      trainingTime: profile.trainingTime || "",
      trainingDays: profile.trainingDays ? String(profile.trainingDays) : "",
      trainingDurationMin: profile.trainingDurationMin ? String(profile.trainingDurationMin) : "",
      activityLevel: profile.activityLevel || "",
      usesSteroids: Boolean(profile.usesSteroids),
      steroids: profile.steroids || "",
      preferredFoods: profile.preferredFoods || "",
      allergies: profile.allergies || "",
    });
  }, [profile]);

  const handleSave = async () => {
    await updateProfileMutation.mutateAsync({
      name: formState.name || undefined,
      age: formState.age ? Number(formState.age) : undefined,
      heightCm: formState.heightCm ? Number(formState.heightCm) : undefined,
      gender: formState.gender || undefined,
      goal: formState.goal || undefined,
      wakeUpTime: formState.wakeUpTime || undefined,
      firstMealTime: formState.firstMealTime || undefined,
      trainingTime: formState.trainingTime || undefined,
      trainingDays: formState.trainingDays ? Number(formState.trainingDays) : undefined,
      trainingDurationMin: formState.trainingDurationMin
        ? Number(formState.trainingDurationMin)
        : undefined,
      activityLevel: formState.activityLevel || undefined,
      usesSteroids: formState.usesSteroids,
      steroids: formState.steroids || undefined,
      preferredFoods: formState.preferredFoods || undefined,
      allergies: formState.allergies || undefined,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const initials = formState.name
    ? formState.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
    : "AI";

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title="PERFIL"
        rightElement={
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-5 w-5" />
          </Button>
        }
      />

      <main className="px-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-display text-3xl">
            {initials}
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground">{formState.name}</h2>
            <p className="text-sm text-muted-foreground">{meData?.user?.email || "Conta"}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {formState.goal || "Defina seu objetivo"}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Scale className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Peso</p>
            <p className="font-bold text-foreground">{latestMeasurement?.weightKg || 0} kg</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Ruler className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Altura</p>
            <p className="font-bold text-foreground">{formState.heightCm || 0} cm</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Idade</p>
            <p className="font-bold text-foreground">{formState.age || 0} anos</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              DADOS PESSOAIS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-xs">Nome</Label>
              {isEditing ? (
                <Input
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium text-foreground">{formState.name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Sexo</Label>
                {isEditing ? (
                  <Input
                    value={formState.gender}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium text-foreground">{formState.gender}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Objetivo</Label>
                {isEditing ? (
                  <Input
                    value={formState.goal}
                    onChange={(e) => setFormState((prev) => ({ ...prev, goal: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium text-foreground">{formState.goal}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              ROTINA DIÁRIA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Acorda as</Label>
                {isEditing ? (
                  <Input
                    type="time"
                    value={formState.wakeUpTime}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, wakeUpTime: e.target.value }))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium text-foreground">{formState.wakeUpTime}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">1a Refeição</Label>
                {isEditing ? (
                  <Input
                    type="time"
                    value={formState.firstMealTime}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, firstMealTime: e.target.value }))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium text-foreground">{formState.firstMealTime}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Horário Treino</Label>
                {isEditing ? (
                  <Input
                    type="time"
                    value={formState.trainingTime}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, trainingTime: e.target.value }))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium text-foreground">{formState.trainingTime}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Dias de Treino</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formState.trainingDays}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, trainingDays: e.target.value }))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium text-foreground">
                    {formState.trainingDays}x / semana
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Duração do Treino</Label>
              {isEditing ? (
                <Input
                  value={formState.trainingDurationMin}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, trainingDurationMin: e.target.value }))
                  }
                  className="mt-1"
                />
              ) : (
                <p className="font-medium text-foreground">{formState.trainingDurationMin} min</p>
              )}
            </div>            <div>
              <Label className="text-muted-foreground text-xs">Nǭvel de Treino</Label>
              {isEditing ? (
                <Input
                  value={formState.activityLevel}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, activityLevel: e.target.value }))
                  }
                  className="mt-1"
                  placeholder="Ex: iniciante, intermediario, avancado"
                />
              ) : (
                <p className="font-medium text-foreground">
                  {formState.activityLevel || "Nǜo informado"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              SUPLEMENTAÇÃO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Uso de Esteroides</Label>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formState.usesSteroids
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {formState.usesSteroids ? "Sim" : "Não"}
                </span>
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!formState.usesSteroids ? "default" : "secondary"}
                    className="flex-1"
                    onClick={() => setFormState((prev) => ({ ...prev, usesSteroids: false }))}
                  >
                    Não
                  </Button>
                  <Button
                    type="button"
                    variant={formState.usesSteroids ? "default" : "secondary"}
                    className="flex-1"
                    onClick={() => setFormState((prev) => ({ ...prev, usesSteroids: true }))}
                  >
                    Sim
                  </Button>
                </div>
              )}
              {formState.usesSteroids && isEditing && (
                <div>
                  <Label className="text-muted-foreground text-xs">Quais e quantidades</Label>
                  <Textarea
                    value={formState.steroids}
                    onChange={(e) => setFormState((prev) => ({ ...prev, steroids: e.target.value }))}
                    placeholder="Ex: Testosterona 500mg/semana"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-primary" />
              PREFERÊNCIAS ALIMENTARES
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={formState.preferredFoods}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, preferredFoods: e.target.value }))
                }
                placeholder="Liste os alimentos que deseja incluir na dieta"
              />
            ) : (
              <p className="text-muted-foreground">{formState.preferredFoods}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-primary" />
              RESTRIÇÕES
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={formState.allergies}
                onChange={(e) => setFormState((prev) => ({ ...prev, allergies: e.target.value }))}
                placeholder="Liste alergias ou restrições alimentares"
              />
            ) : (
              <p className="text-muted-foreground">{formState.allergies || "Nenhuma"}</p>
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </Button>

        {isEditing && (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button
              variant="fitness"
              className="flex-1"
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
