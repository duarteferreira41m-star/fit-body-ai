import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import {
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  User,
  Scale,
  Ruler,
  Calendar,
  Clock,
  Target,
  Apple,
  Pill,
  Check,
  Sparkles,
} from "lucide-react";

const steps = [
  { id: 1, title: "Dados Pessoais", icon: User },
  { id: 2, title: "Medidas", icon: Scale },
  { id: 3, title: "Rotina", icon: Clock },
  { id: 4, title: "Objetivo", icon: Target },
  { id: 5, title: "Alimentação", icon: Apple },
  { id: 6, title: "Suplementação", icon: Pill },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    sex: "masculino",
    weight: "",
    height: "",
    bodyFat: "",
    wakeUpTime: "06:00",
    firstMealTime: "07:00",
    trainingTime: "17:00",
    trainingDays: "5",
    trainingDuration: "60",
    goal: "hipertrofia",
    preferredFoods: "",
    allergies: "",
    usesSteroids: false,
    steroids: "",
  });
  const [photoFiles, setPhotoFiles] = useState<{
    frontRelaxed?: File;
    sideRelaxed?: File;
    backRelaxed?: File;
    frontFlexed?: File;
    sideFlexed?: File;
    backFlexed?: File;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNext = async () => {
    setErrorMessage(null);
    if (currentStep < steps.length) {
      if (currentStep === 2) {
        const missingPhotos =
          !photoFiles.frontRelaxed ||
          !photoFiles.sideRelaxed ||
          !photoFiles.backRelaxed ||
          !photoFiles.frontFlexed ||
          !photoFiles.sideFlexed ||
          !photoFiles.backFlexed;
        if (missingPhotos) {
          setErrorMessage(
            "Envie todas as fotos (frente, lado e costas) em descanso e contraida."
          );
          return;
        }
      }
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const hasToken = Boolean(getToken());
      if (!hasToken) {
        const result = await api.register({
          email: formData.email,
          password: formData.password,
        });
        setToken(result.token);
      }

      await Promise.all([
        api.uploadPhoto(photoFiles.frontRelaxed as File, "Frente - Relaxado"),
        api.uploadPhoto(photoFiles.sideRelaxed as File, "Lado - Relaxado"),
        api.uploadPhoto(photoFiles.backRelaxed as File, "Costas - Relaxado"),
        api.uploadPhoto(photoFiles.frontFlexed as File, "Frente - Contraida"),
        api.uploadPhoto(photoFiles.sideFlexed as File, "Lado - Contraida"),
        api.uploadPhoto(photoFiles.backFlexed as File, "Costas - Contraida"),
      ]);

      await api.updateProfile({
        name: formData.name || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.sex || undefined,
        goal: formData.goal || undefined,
        wakeUpTime: formData.wakeUpTime || undefined,
        firstMealTime: formData.firstMealTime || undefined,
        trainingTime: formData.trainingTime || undefined,
        trainingDays: formData.trainingDays ? Number(formData.trainingDays) : undefined,
        trainingDurationMin: formData.trainingDuration
          ? Number(formData.trainingDuration)
          : undefined,
        preferredFoods: formData.preferredFoods || undefined,
        allergies: formData.allergies || undefined,
        usesSteroids: formData.usesSteroids,
        steroids: formData.steroids || undefined,
        heightCm: formData.height ? Number(formData.height) : undefined,
      });

      if (formData.weight || formData.bodyFat) {
        await api.createMeasurement({
          weightKg: formData.weight ? Number(formData.weight) : undefined,
          bodyFatPct: formData.bodyFat ? Number(formData.bodyFat) : undefined,
        });
      }

      navigate("/");
    } catch (error) {
      let message = "Não foi possível concluir o cadastro. Tente novamente.";
      if (error instanceof Error && error.message) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed && typeof parsed.error === "string") {
            message = parsed.error;
          } else {
            message = error.message;
          }
        } catch {
          message = error.message;
        }
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setErrorMessage(null);
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePhotoFile = (field: keyof typeof photoFiles, file?: File) => {
    setPhotoFiles((prev) => ({ ...prev, [field]: file }));
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 pt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-foreground">FITAI PRO</h1>
            <p className="text-xs text-muted-foreground">Seu coach de IA</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Passo {currentStep} de {steps.length}
            </span>
            <span className="text-primary font-medium">{steps[currentStep - 1].title}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-success text-success-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl text-foreground mb-2">
                    VAMOS COMEÇAR!
                  </h2>
                  <p className="text-muted-foreground">
                    Conte-nos um pouco sobre você
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Nome completo</Label>
                    <Input
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Senha</Label>
                    <Input
                      type="password"
                      placeholder="Crie uma senha"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Idade</Label>
                      <Input
                        type="number"
                        placeholder="28"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Sexo</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant={formData.sex === "masculino" ? "default" : "secondary"}
                          className="flex-1"
                          onClick={() => updateFormData("sex", "masculino")}
                        >
                          Masculino
                        </Button>
                        <Button
                          type="button"
                          variant={formData.sex === "feminino" ? "default" : "secondary"}
                          className="flex-1"
                          onClick={() => updateFormData("sex", "feminino")}
                        >
                          Feminino
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl text-foreground mb-2">
                    SUAS MEDIDAS
                  </h2>
                  <p className="text-muted-foreground">
                    Para calcular suas necessidades
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary" />
                      Peso atual (kg)
                    </Label>
                    <Input
                      type="number"
                      placeholder="78.5"
                      value={formData.weight}
                      onChange={(e) => updateFormData("weight", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      Altura (cm)
                    </Label>
                    <Input
                      type="number"
                      placeholder="178"
                      value={formData.height}
                      onChange={(e) => updateFormData("height", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>% de gordura corporal (opcional)</Label>
                    <Input
                      type="number"
                      placeholder="18"
                      value={formData.bodyFat}
                      onChange={(e) => updateFormData("bodyFat", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se não souber, podemos estimar com as fotos
                    </p>
                  </div>
                  <div className="pt-4">
                    <Label>Fotos em descanso (obrigatorio)</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <label className="w-[10cm] h-[12cm] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="text-xs text-muted-foreground">Frente</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updatePhotoFile("frontRelaxed", e.target.files?.[0])
                          }
                        />
                        {photoFiles.frontRelaxed && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {photoFiles.frontRelaxed.name}
                          </span>
                        )}
                      </label>
                      <label className="w-[10cm] h-[12cm] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="text-xs text-muted-foreground">Lado</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updatePhotoFile("sideRelaxed", e.target.files?.[0])
                          }
                        />
                        {photoFiles.sideRelaxed && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {photoFiles.sideRelaxed.name}
                          </span>
                        )}
                      </label>
                      <label className="w-[10cm] h-[12cm] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="text-xs text-muted-foreground">Costas</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updatePhotoFile("backRelaxed", e.target.files?.[0])
                          }
                        />
                        {photoFiles.backRelaxed && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {photoFiles.backRelaxed.name}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Label>Fotos com musculatura contraida (obrigatorio)</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <label className="w-[10cm] h-[12cm] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="text-xs text-muted-foreground">Frente</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updatePhotoFile("frontFlexed", e.target.files?.[0])
                          }
                        />
                        {photoFiles.frontFlexed && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {photoFiles.frontFlexed.name}
                          </span>
                        )}
                      </label>
                      <label className="w-[10cm] h-[12cm] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="text-xs text-muted-foreground">Lado</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updatePhotoFile("sideFlexed", e.target.files?.[0])
                          }
                        />
                        {photoFiles.sideFlexed && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {photoFiles.sideFlexed.name}
                          </span>
                        )}
                      </label>
                      <label className="w-[10cm] h-[12cm] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="text-xs text-muted-foreground">Costas</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updatePhotoFile("backFlexed", e.target.files?.[0])
                          }
                        />
                        {photoFiles.backFlexed && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {photoFiles.backFlexed.name}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl text-foreground mb-2">
                    SUA ROTINA
                  </h2>
                  <p className="text-muted-foreground">
                    Para personalizar seu plano
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Horário que acorda
                      </Label>
                      <Input
                        type="time"
                        value={formData.wakeUpTime}
                        onChange={(e) => updateFormData("wakeUpTime", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>1ª Refeição</Label>
                      <Input
                        type="time"
                        value={formData.firstMealTime}
                        onChange={(e) => updateFormData("firstMealTime", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Horário preferido para treino</Label>
                    <Input
                      type="time"
                      value={formData.trainingTime}
                      onChange={(e) => updateFormData("trainingTime", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Quantos dias treina por semana?</Label>
                    <div className="flex gap-2 mt-2">
                      {["3", "4", "5", "6"].map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={formData.trainingDays === day ? "default" : "secondary"}
                          className="flex-1"
                          onClick={() => updateFormData("trainingDays", day)}
                        >
                          {day}x
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Tempo disponível para treino (minutos)</Label>
                    <div className="flex gap-2 mt-2">
                      {["45", "60", "90", "120"].map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={formData.trainingDuration === time ? "default" : "secondary"}
                          className="flex-1"
                          onClick={() => updateFormData("trainingDuration", time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl text-foreground mb-2">
                    SEU OBJETIVO
                  </h2>
                  <p className="text-muted-foreground">
                    O que você quer alcançar?
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "hipertrofia", label: "Hipertrofia", desc: "Ganhar massa muscular" },
                    { id: "cutting", label: "Cutting", desc: "Perder gordura mantendo músculo" },
                    { id: "recomp", label: "Recomposição", desc: "Perder gordura e ganhar músculo" },
                    { id: "forca", label: "Força", desc: "Aumentar força máxima" },
                    { id: "resistencia", label: "Resistência", desc: "Melhorar condicionamento" },
                  ].map((goal) => (
                    <Card
                      key={goal.id}
                      className={`cursor-pointer transition-all ${
                        formData.goal === goal.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/30"
                      }`}
                      onClick={() => updateFormData("goal", goal.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{goal.label}</p>
                          <p className="text-sm text-muted-foreground">{goal.desc}</p>
                        </div>
                        {formData.goal === goal.id && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl text-foreground mb-2">
                    ALIMENTAÇÃO
                  </h2>
                  <p className="text-muted-foreground">
                    Suas preferências alimentares
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Alimentos que deseja incluir na dieta</Label>
                    <Textarea
                      placeholder="Ex: frango, ovos, arroz, batata doce, brócolis, aveia..."
                      value={formData.preferredFoods}
                      onChange={(e) => updateFormData("preferredFoods", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label>Alergias ou restrições alimentares</Label>
                    <Textarea
                      placeholder="Ex: lactose, glúten, frutos do mar..."
                      value={formData.allergies}
                      onChange={(e) => updateFormData("allergies", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl text-foreground mb-2">
                    SUPLEMENTAÇÃO
                  </h2>
                  <p className="text-muted-foreground">
                    Para ajustar seu plano
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block">Faz uso de esteroides anabolizantes?</Label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={!formData.usesSteroids ? "default" : "secondary"}
                        className="flex-1"
                        onClick={() => updateFormData("usesSteroids", false)}
                      >
                        Não
                      </Button>
                      <Button
                        type="button"
                        variant={formData.usesSteroids ? "default" : "secondary"}
                        className="flex-1"
                        onClick={() => updateFormData("usesSteroids", true)}
                      >
                        Sim
                      </Button>
                    </div>
                  </div>

                  {formData.usesSteroids && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Label>Quais compostos e dosagens?</Label>
                      <Textarea
                        placeholder="Ex: Testosterona Enantato 500mg/semana, Oxandrolona 40mg/dia..."
                        value={formData.steroids}
                        onChange={(e) => updateFormData("steroids", e.target.value)}
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Essa informação é confidencial e será usada apenas para ajustar seu
                        treino e dieta de forma otimizada.
                      </p>
                    </motion.div>
                  )}

                  {currentStep === 6 && (
                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 mt-6">
                      <CardContent className="p-5 text-center">
                        <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
                        <h3 className="font-display text-xl text-foreground mb-2">
                          TUDO PRONTO!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nossa IA vai criar seu plano personalizado de treino e dieta
                          baseado nas suas informações.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer buttons */}
      <footer className="p-4 pb-8 space-y-3">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="secondary" size="lg" onClick={handleBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="fitness"
            size="lg"
            className="flex-1"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {currentStep === steps.length ? (
              <>
                <Sparkles className="h-5 w-5" />
                {isSubmitting ? "Salvando..." : "Criar Meu Plano"}
              </>
            ) : (
              <>
                Continuar
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </footer>
    </div>
  );
};

export default Onboarding;

