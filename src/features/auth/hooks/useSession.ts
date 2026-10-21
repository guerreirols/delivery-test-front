import { useSyncExternalStore } from "react";
import { session } from "../services/session";

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.getSnapshot);
}
