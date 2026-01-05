import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Upload,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const bodyAnalysis = {
  lastUpdate: "03/01/2026",
  overallScore: 72,
  strengths: [
    { area: "Braços", score: 85, description: "Bom desenvolvimento de bíceps e tríceps" },
    { area: "Costas", score: 78, description: "Largura proporcional e definição adequada" },
    { area: "Ombros", score: 75, description: "Deltoides bem formados" },
  ],
  weaknesses: [
    { area: "Pernas", score: 55, description: "Quadríceps precisa de mais volume" },
    { area: "Panturrilha", score: 48, description: "Área que necessita atenção especial" },
    { area: "Abdômen", score: 60, description: "Reduzir % de gordura para mais definição" },
  ],
  recommendations: [
    "Aumentar frequência de treino de pernas para 2x por semana",
    "Adicionar exercícios específicos para panturrilha",
    "Manter déficit calórico moderado para definição abdominal",
    "Continuar progressão de carga nos treinos de braço",
  ],
};

const Analysis = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="ANÁLISE CORPORAL" subtitle="Avaliação por IA" />

      <main className="px-4 space-y-6">
        {/* Photo upload */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20"
        >
          <div className="text-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 mx-auto flex items-center justify-center mb-3">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl text-foreground">ATUALIZE SUAS FOTOS</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Envie fotos de frente, costas e lateral para análise
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {["Frente", "Costas", "Lateral"].map((view) => (
              <div
                key={view}
                className="aspect-[3/4] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">{view}</span>
              </div>
            ))}
          </div>

          <Button
            variant="fitness"
            className="w-full"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Sparkles className="h-5 w-5 animate-pulse" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analisar com IA
              </>
            )}
          </Button>
        </motion.section>

        {/* Overall score */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg text-foreground">SCORE GERAL</h3>
                  <p className="text-xs text-muted-foreground">
                    Última atualização: {bodyAnalysis.lastUpdate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-primary">{bodyAnalysis.overallScore}</p>
                  <p className="text-xs text-muted-foreground">de 100</p>
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${bodyAnalysis.overallScore}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Strengths */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-success" />
            <h3 className="font-display text-lg text-foreground">PONTOS FORTES</h3>
          </div>
          <div className="space-y-3">
            {bodyAnalysis.strengths.map((item, index) => (
              <motion.div
                key={item.area}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="border-success/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-semibold text-foreground">{item.area}</span>
                      </div>
                      <span className="text-success font-bold">{item.score}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Weaknesses */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-5 w-5 text-warning" />
            <h3 className="font-display text-lg text-foreground">PONTOS A MELHORAR</h3>
          </div>
          <div className="space-y-3">
            {bodyAnalysis.weaknesses.map((item, index) => (
              <motion.div
                key={item.area}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="border-warning/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="font-semibold text-foreground">{item.area}</span>
                      </div>
                      <span className="text-warning font-bold">{item.score}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">RECOMENDAÇÕES DA IA</h3>
          </div>
          <Card>
            <CardContent className="p-4 space-y-3">
              {bodyAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Analysis;
