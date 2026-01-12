import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";

const Onboarding = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: "name" | "email" | "phone" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.register({
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        phone: form.phone || undefined,
      });
      setToken(result.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Não foi possível criar a conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
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
            <p className="text-sm text-muted-foreground">Crie sua conta</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
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
              <Label>Telefone</Label>
              <Input
                type="tel"
                placeholder="(61) 9 9999-9999"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="Crie uma senha"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-3">
            <Button variant="fitness" className="w-full" onClick={handleRegister} disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
            </Button>
          </div>

          <button className="w-full text-sm text-primary" onClick={() => navigate("/login")}>Entrar</button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

