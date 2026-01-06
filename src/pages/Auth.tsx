import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";

const Auth = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleChange = (field: "email" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.login(form);
      setToken(result.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Não foi possível entrar. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-xl bg-primary mx-auto flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl text-foreground">FITAI PRO</h1>
            <p className="text-sm text-muted-foreground">Entre para continuar</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="********"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-3">
            <Button variant="fitness" className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              <Sparkles className="h-4 w-4" />
              Entrar com Google
            </Button>
          </div>

          <button
            className="w-full text-sm text-primary"
            onClick={() => navigate("/onboarding")}
          >
            Criar conta nova
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
