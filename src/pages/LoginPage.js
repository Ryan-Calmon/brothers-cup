import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { login as loginApi } from "../services/api";
import { Card, Button, Input } from "../Components/ui";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!username || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await loginApi(username, password);
      handleLogin(data.token, data.user);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Credenciais inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏆</div>
          <h1 className="text-xl font-bold text-white">Brothers Cup</h1>
          <p className="text-brand-200/60 text-sm mt-1">
            Painel Administrativo
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Usuário"
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            placeholder="Seu usuário"
            autoComplete="username"
            disabled={isLoading}
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Sua senha"
            autoComplete="current-password"
            disabled={isLoading}
          />

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-brand-300/30 text-xs text-center mt-6">
          Acesso restrito a administradores
        </p>
      </Card>
    </div>
  );
}
