import { useEffect, useState } from "react";
import { session } from "../services/session";
import { isRecord } from "../../../shared/api/client";
import { Button } from "../../../shared/ui/Button";

export function UserName() {
  const [name, setName] = useState("");
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setFailed(false);
      try {
        const profile = await session.authorized("/users/me", { signal: controller.signal });
        if (!isRecord(profile) || typeof profile.name !== "string" || !profile.name.trim())
          throw new Error("Invalid profile");
        if (!controller.signal.aborted) setName(profile.name);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [revision]);
  if (failed)
    return <Button variant="text" onClick={() => setRevision(current => current + 1)}>Recarregar meu nome</Button>;
  return <span className="user-name" title={name}>{name || "Carregando usuário…"}</span>;
}

