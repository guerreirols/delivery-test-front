import { useEffect, useState } from "react";
import { errorMessage } from "../../../shared/api/client";
import { listOrders } from "../services/orders";
import type { OrderPage } from "../types/order";

export function useOrders(page: number) {
  const [data, setData] = useState<OrderPage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await listOrders(page, controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (failure) {
        if (!controller.signal.aborted) setError(errorMessage(failure));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page, revision]);
  return {
    data,
    loading,
    error,
    reload: () => setRevision((current) => current + 1),
  };
}
