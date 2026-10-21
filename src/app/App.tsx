import { useEffect, useState } from "react";
import { AuthPage } from "../features/auth/pages/AuthPage";
import { useSession } from "../features/auth/hooks/useSession";
import { session } from "../features/auth/services/session";
import { OrdersPage } from "../features/orders/pages/OrdersPage";
import { UserName } from "../features/auth/components/UserName";
import { Brand } from "../shared/ui/Brand";
import { Button } from "../shared/ui/Button";

export default function App() {
  const status = useSession();
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void session.restore();
  }, []);
  async function logout() {
    setNotice("");
    try {
      await session.logout();
    } catch {
      setNotice(
        "Você saiu neste navegador, mas não foi possível confirmar o encerramento no servidor. Tente entrar e sair novamente quando a conexão voltar.",
      );
    }
  }
  if (status === "restoring")
    return (
      <main className="session-screen">
        <Brand />
        <p role="status">Preparando seu espaço…</p>
      </main>
    );
  if (status !== "authenticated")
    return <AuthPage notice={status === "unavailable"
      ? "Não foi possível verificar sua sessão. Confira sua conexão e entre novamente para continuar."
      : notice} />;
  return (
    <>
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      <header className="app-header">
        <div className="header-inner">
          <Brand />
          <span className="header-section">Gestão de pedidos</span>
          <div className="header-session">
            <UserName />
            <Button
              variant="text"
              onClick={() => {
                void logout();
              }}
            >
              Sair <span aria-hidden="true">↗</span>
            </Button>
          </div>
        </div>
      </header>
      <OrdersPage />
    </>
  );
}


