import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, errorMessage } from "../../../shared/api/client";
import { Brand } from "../../../shared/ui/Brand";
import { Button } from "../../../shared/ui/Button";
import { Field } from "../../../shared/ui/Field";
import { Feedback } from "../../../shared/ui/Feedback";
import { session } from "../services/session";

interface AuthPageProps {
  notice: string;
}

export function AuthPage({ notice }: AuthPageProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [registering]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    setBusy(true);
    setError("");
    setFields({});
    setSuccess("");
    try {
      if (registering) {
        await session.register({ name, email, password });
        setRegistering(false);
        setSuccess(
          "Conta criada! Entre com seu e-mail e senha para continuar.",
        );
      } else await session.login({ email, password });
    } catch (failure) {
      setError(errorMessage(failure));
      if (failure instanceof ApiError) setFields(failure.fieldErrors);
    } finally {
      setBusy(false);
    }
  }
  function switchMode() {
    setRegistering((current) => !current);
    setError("");
    setFields({});
    setSuccess("");
  }
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-content">
          <span className="eyebrow">MENOS COMPLEXIDADE. MAIS CONTROLE.</span>
          <h1>
            Cada pedido.
            <br />
            No seu ritmo.
          </h1>
          <p>
            Do primeiro registro à entrega, mantenha sua operação organizada em
            um só lugar.
          </p>
          <div className="journey" aria-hidden="true">
            <span>
              01 <b>Receba</b>
            </span>
            <span>
              02 <b>Acompanhe</b>
            </span>
            <span>
              03 <b>Entregue</b>
            </span>
          </div>
        </div>
        <span className="auth-footer">
          Uma operação mais simples começa aqui.
        </span>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">SEU ESPAÇO DE TRABALHO</span>
          <h2>{registering ? "Vamos começar?" : "Bom ter você aqui."}</h2>
          <p className="muted">
            {registering
              ? "Crie sua conta para organizar os próximos pedidos."
              : "Entre na sua conta para acompanhar os pedidos."}
          </p>
          {notice && <Feedback>{notice}</Feedback>}
          {success && <Feedback tone="success">{success}</Feedback>}
          <form ref={formRef} onSubmit={submit} className="auth-form">
            {registering && (
              <Field
                label="Nome completo"
                name="name"
                autoComplete="name"
                maxLength={120}
                required
                error={fields.name}
              />
            )}
            <Field
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              maxLength={254}
              required
              error={fields.email}
            />
            <Field
              key={registering ? "new" : "current"}
              label="Senha"
              name="password"
              type="password"
              autoComplete={registering ? "new-password" : "current-password"}
              minLength={registering ? 8 : undefined}
              maxLength={64}
              required
              error={fields.password}
              hint={registering ? "Use de 8 a 64 caracteres." : undefined}
            />
            {error && <Feedback>{error}</Feedback>}
            <Button type="submit" busy={busy}>
              {busy
                ? "Aguarde…"
                : registering
                  ? "Criar conta"
                  : "Entrar na minha conta"}
              <span aria-hidden="true">↗</span>
            </Button>
          </form>
          <p className="auth-switch">
            {registering ? "Já tem uma conta?" : "Primeira vez por aqui?"}{" "}
            <Button
              variant="text"
              type="button"
              onClick={switchMode}
              disabled={busy}
            >
              {registering ? "Entrar" : "Criar conta"}
            </Button>
          </p>
          <p className="security-note">
            <span aria-hidden="true">◇</span> Seu acesso é pessoal e protegido.
          </p>
        </div>
      </section>
    </main>
  );
}
