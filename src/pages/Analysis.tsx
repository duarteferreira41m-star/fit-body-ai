import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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

const Analysis = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<{ front?: File; back?: File; side?: File }>({});

  const { data: analysisData } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => api.getAnalyses(),
  });

  const latestAnalysis = analysisData?.analyses?.[0];

  const handleFileChange = (view: "front" | "back" | "side", file?: File) => {
    setFiles((prev) => ({ ...prev, [view]: file }));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);
    try {
      const uploads = [] as { id: string }[];
      if (files.front) uploads.push((await api.uploadPhoto(files.front, "Frente")).photo);
      if (files.back) uploads.push((await api.uploadPhoto(files.back, "Costas")).photo);
      if (files.side) uploads.push((await api.uploadPhoto(files.side, "Lateral")).photo);

      const photoIds = uploads.map((item) => item.id);
      await api.runAnalysis(photoIds.length ? photoIds : undefined);
      await queryClient.invalidateQueries({ queryKey: ["analyses"] });
      setFiles({});
    } catch (err) {
      setError("Não foi possível analisar as fotos. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="ANÁLISE CORPORAL" subtitle="Avaliação por IA" />

      <main className="px-4 space-y-6">
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
            <label className="aspect-[3/4] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Frente</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("front", e.target.files?.[0])}
              />
            </label>
            <label className="aspect-[3/4] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Costas</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("back", e.target.files?.[0])}
              />
            </label>
            <label className="aspect-[3/4] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Lateral</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("side", e.target.files?.[0])}
              />
            </label>
          </div>

          <Button variant="fitness" className="w-full" onClick={handleUpload} disabled={isUploading}>
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
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </motion.section>

        {latestAnalysis && (
          <>
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
                      <p className="text-xs text-muted-foreground">Atualizado recentemente</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-primary">
                        {latestAnalysis.symmetryScore || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">de 100</p>
                    </div>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${latestAnalysis.symmetryScore || 0}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Gordura corporal estimada: {latestAnalysis.bodyFatEstimate || 0}%
                  </p>
                  {latestAnalysis.rawSummary && (
                    <p className="text-sm text-muted-foreground mt-2">{latestAnalysis.rawSummary}</p>
                  )}
                </CardContent>
              </Card>
            </motion.section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <h3 className="font-display text-lg text-foreground">PONTOS FORTES</h3>
              </div>
              <div className="space-y-3">
                {latestAnalysis.strengths.map((item) => (
                  <Card key={item} className="border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-semibold text-foreground">{item}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-5 w-5 text-warning" />
                <h3 className="font-display text-lg text-foreground">PONTOS A MELHORAR</h3>
              </div>
              <div className="space-y-3">
                {latestAnalysis.weaknesses.map((item) => (
                  <Card key={item} className="border-warning/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="font-semibold text-foreground">{item}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg text-foreground">RECOMENDAÇÕES DA IA</h3>
              </div>
              <Card>
                <CardContent className="p-4 space-y-3">
                  {(latestAnalysis.rawSummary ? [latestAnalysis.rawSummary] : []).map((rec, index) => (
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
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Analysis;
