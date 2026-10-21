import { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { Feedback } from "../../../shared/ui/Feedback";
import { OrderList } from "../components/OrderList";
import { CreateOrderForm } from "../components/CreateOrderForm";
import { useOrders } from "../hooks/useOrders";
import type { Order } from "../types/order";

function initialPage(): number {
  const value = Number(new URLSearchParams(location.search).get("page"));
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function OrdersPage() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [success, setSuccess] = useState("");
  const { data, loading, error, reload } = useOrders(page);
  useEffect(() => {
    headingRef.current?.focus();
  }, [creating]);
  function changePage(next: number) {
    setPage(next);
    const url = new URL(location.href);
    if (next) url.searchParams.set("page", String(next));
    else url.searchParams.delete("page");
    history.replaceState(null, "", url);
  }
  function created(order: Order) {
    setSuccess(
      `Pedido #${order.id.slice(-8).toUpperCase()} criado com sucesso.`,
    );
    setCreating(false);
    changePage(0);
    reload();
  }
  if (creating)
    return (
      <main id="main-content" className="workspace">
        <Button
          variant="text"
          disabled={submitting}
          onClick={() => setCreating(false)}
          className="back-button"
        >
          ← Voltar para pedidos
        </Button>
        <header className="page-heading">
          <div>
            <span className="eyebrow">NOVO PEDIDO</span>
            <h1 tabIndex={-1} ref={headingRef}>
              Uma nova entrega começa aqui.
            </h1>
            <p className="muted">
              Preencha os dados e confira os itens antes de criar.
            </p>
          </div>
        </header>
        <CreateOrderForm
          onBusyChange={setSubmitting}
          onCreated={created}
          onCancel={() => setCreating(false)}
        />
      </main>
    );
  const count = data?.totalElements ?? 0;
  return (
    <main id="main-content" className="workspace">
      <header className="page-heading">
        <div>
          <span className="eyebrow">SUA OPERAÇÃO, EM ORDEM</span>
          <h1 tabIndex={-1} ref={headingRef}>
            Pedidos<span className="heading-dot">.</span>
          </h1>
          <p className="muted">
            Acompanhe cada entrega e mantenha tudo em movimento.
          </p>
        </div>
        <Button
          onClick={() => {
            setSuccess("");
            setCreating(true);
          }}
        >
          <span aria-hidden="true">+</span> Novo pedido
        </Button>
      </header>
      {success && <Feedback tone="success">{success}</Feedback>}
      <section
        className="orders-panel"
        aria-label="Lista de pedidos"
        aria-busy={loading}
      >
        <header className="list-heading">
          <div>
            <h2>Todos os pedidos</h2>
            {data && <span className="count-badge">{count}</span>}
          </div>
          <Button
            variant="text"
            onClick={reload}
            busy={loading}
            aria-label="Atualizar pedidos"
          >
            <span aria-hidden="true">↻</span> Atualizar
          </Button>
        </header>
        {error && (
          <div className="list-feedback">
            <Feedback>{error}</Feedback>
            <Button variant="secondary" onClick={reload} disabled={loading}>
              Tentar novamente
            </Button>
          </div>
        )}
        {loading && !data && (
          <div className="empty-state" role="status">
            <span className="spinner spinner--large" />
            <h3>Buscando seus pedidos…</h3>
            <p>Estamos organizando as informações para você.</p>
          </div>
        )}
        {data && data.content.length > 0 && <OrderList orders={data.content} onUpdated={reload} />}
        {data && !loading && !error && data.content.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ↗
            </span>
            <h3>
              {page > 0
                ? "Nenhum pedido nesta página."
                : "Tudo pronto para o primeiro pedido."}
            </h3>
            <p>
              {page > 0
                ? "Volte ao início para conferir os pedidos disponíveis."
                : "Comece adicionando os dados da entrega e os itens."}
            </p>
            <Button
              variant="secondary"
              onClick={() => (page > 0 ? changePage(0) : setCreating(true))}
            >
              {page > 0 ? "Ir para primeira página" : "Criar primeiro pedido"}
            </Button>
          </div>
        )}
        {data && data.content.length > 0 && (
          <footer className="pagination">
            <span>
              {data.number * data.size + 1}–
              {Math.min((data.number + 1) * data.size, count)} de {count}{" "}
              pedidos
            </span>
            <div>
              <Button
                variant="secondary"
                onClick={() => changePage(page - 1)}
                disabled={page === 0 || loading}
                aria-label="Página anterior"
              >
                ←
              </Button>
              <span>
                Página {data.number + 1} de {Math.max(1, data.totalPages)}
              </span>
              <Button
                variant="secondary"
                onClick={() => changePage(page + 1)}
                disabled={page + 1 >= data.totalPages || loading}
                aria-label="Próxima página"
              >
                →
              </Button>
            </div>
          </footer>
        )}
      </section>
      <p className="workspace-footnote">
        Cada pedido conta. Cada entrega importa.
      </p>
    </main>
  );
}

