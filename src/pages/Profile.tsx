import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Settings,
  Bell,
  Shield,
  ChevronRight,
  Scale,
  Ruler,
  Calendar,
  Clock,
  Dumbbell,
  Pill,
  Apple,
  LogOut,
  Edit,
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: "João da Silva",
    email: "joao@email.com",
    age: 28,
    weight: 78.5,
    height: 178,
    sex: "Masculino",
    goal: "Hipertrofia",
    wakeUpTime: "06:00",
    firstMealTime: "07:00",
    trainingTime: "17:00",
    trainingDays: 5,
    trainingDuration: "60-90 min",
    usesSteroids: false,
    steroids: "",
    preferredFoods: "Frango, ovos, arroz, batata doce, brócolis",
  };

  const menuItems = [
    { icon: Bell, label: "Notificações", path: "/notifications" },
    { icon: Settings, label: "Configurações", path: "/settings" },
    { icon: Shield, label: "Privacidade", path: "/privacy" },
  ];

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
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-display text-3xl">
            JS
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground">{userProfile.name}</h2>
            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {userProfile.goal}
            </span>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Scale className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Peso</p>
            <p className="font-bold text-foreground">{userProfile.weight} kg</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Ruler className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Altura</p>
            <p className="font-bold text-foreground">{userProfile.height} cm</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Idade</p>
            <p className="font-bold text-foreground">{userProfile.age} anos</p>
          </div>
        </div>

        {/* Routine info */}
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
                <Label className="text-muted-foreground text-xs">Acorda às</Label>
                {isEditing ? (
                  <Input type="time" defaultValue={userProfile.wakeUpTime} className="mt-1" />
                ) : (
                  <p className="font-medium text-foreground">{userProfile.wakeUpTime}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">1ª Refeição</Label>
                {isEditing ? (
                  <Input type="time" defaultValue={userProfile.firstMealTime} className="mt-1" />
                ) : (
                  <p className="font-medium text-foreground">{userProfile.firstMealTime}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Horário Treino</Label>
                {isEditing ? (
                  <Input type="time" defaultValue={userProfile.trainingTime} className="mt-1" />
                ) : (
                  <p className="font-medium text-foreground">{userProfile.trainingTime}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Dias de Treino</Label>
                {isEditing ? (
                  <Input type="number" defaultValue={userProfile.trainingDays} className="mt-1" />
                ) : (
                  <p className="font-medium text-foreground">{userProfile.trainingDays}x / semana</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Duração do Treino</Label>
              {isEditing ? (
                <Input defaultValue={userProfile.trainingDuration} className="mt-1" />
              ) : (
                <p className="font-medium text-foreground">{userProfile.trainingDuration}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supplements / Steroids */}
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
                    userProfile.usesSteroids
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {userProfile.usesSteroids ? "Sim" : "Não"}
                </span>
              </div>
              {userProfile.usesSteroids && isEditing && (
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Quais e quantidades
                  </Label>
                  <Textarea
                    defaultValue={userProfile.steroids}
                    placeholder="Ex: Testosterona 500mg/semana"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Food preferences */}
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
                defaultValue={userProfile.preferredFoods}
                placeholder="Liste os alimentos que deseja incluir na dieta"
              />
            ) : (
              <p className="text-muted-foreground">{userProfile.preferredFoods}</p>
            )}
          </CardContent>
        </Card>

        {/* Menu items */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <Button variant="outline" className="w-full text-destructive border-destructive/30">
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </Button>

        {isEditing && (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button variant="fitness" className="flex-1" onClick={() => setIsEditing(false)}>
              Salvar Alterações
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
