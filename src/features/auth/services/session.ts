import { ApiError, isRecord, request } from "../../../shared/api/client";

export type SessionStatus =
  "restoring" | "authenticated" | "anonymous" | "unavailable";
export interface LoginInput {
  email: string;
  password: string;
}
export interface RegisterInput extends LoginInput {
  name: string;
}

export class Session {
  private token: string | null = null;
  private generation = 0;
  private refreshPromise: Promise<void> | null = null;
  private loginPromise: Promise<void> | null = null;
  private logoutPromise: Promise<void> | null = null;
  private listeners = new Set<() => void>();
  private status: SessionStatus = "restoring";
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = (): SessionStatus => this.status;
  private publish(status: SessionStatus): void {
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }
  private accept(body: unknown, generation: number): void {
    if (generation !== this.generation)
      throw new ApiError(401, "A sessão foi encerrada.");
    if (
      !isRecord(body) ||
      typeof body.accessToken !== "string" ||
      body.tokenType !== "Bearer" ||
      typeof body.expiresIn !== "number"
    )
      throw new ApiError(502, "O serviço retornou uma sessão inválida.");
    this.token = body.accessToken;
    this.publish("authenticated");
  }
  async restore(): Promise<void> {
    const generation = this.generation;
    try {
      await this.refresh();
    } catch (error) {
      if (generation === this.generation) {
        this.token = null;
        this.publish(
          error instanceof ApiError && error.status === 401
            ? "anonymous"
            : "unavailable",
        );
      }
    }
  }
  async register(input: RegisterInput): Promise<void> {
    await request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }
  async login(input: LoginInput): Promise<void> {
    if (this.logoutPromise) await this.logoutPromise.catch(() => undefined);
    const generation = ++this.generation;
    const pendingRefresh = this.refreshPromise;
    if (pendingRefresh) await pendingRefresh.catch(() => undefined);
    if (generation !== this.generation)
      throw new ApiError(401, "A sessão foi encerrada.");
    const promise = request("/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((body) => this.accept(body, generation));
    this.loginPromise = promise;
    try {
      await promise;
    } finally {
      if (this.loginPromise === promise) this.loginPromise = null;
    }
  }
  refresh(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;
    const generation = this.generation;
    const promise = request("/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "X-Refresh-Request": "true" },
    })
      .then((body) => this.accept(body, generation))
      .catch((error: unknown) => {
        if (
          generation === this.generation &&
          error instanceof ApiError &&
          error.status === 401
        ) {
          this.token = null;
          this.publish("anonymous");
        }
        throw error;
      })
      .finally(() => {
        if (this.refreshPromise === promise) this.refreshPromise = null;
      });
    this.refreshPromise = promise;
    return promise;
  }
  async authorized(path: string, options: RequestInit = {}): Promise<unknown> {
    const generation = this.generation;
    const originalToken = this.token;
    if (!originalToken) throw new ApiError(401, "Entre para continuar.");
    const execute = () =>
      request(path, {
        ...options,
        headers: {
          ...Object.fromEntries(new Headers(options.headers)),
          Authorization: `Bearer ${this.token}`,
        },
      });
    let result: unknown;
    try {
      result = await execute();
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 401 ||
        generation !== this.generation
      )
        throw error;
      if (this.token === originalToken) await this.refresh();
      if (generation !== this.generation || !this.token)
        throw new ApiError(401, "A sessão foi encerrada.");
      try {
        result = await execute();
      } catch (retryError) {
        if (
          generation === this.generation &&
          retryError instanceof ApiError &&
          retryError.status === 401
        ) {
          this.token = null;
          this.publish("anonymous");
        }
        throw retryError;
      }
    }
    if (generation !== this.generation)
      throw new ApiError(401, "A sessão foi encerrada.");
    return result;
  }
  logout(): Promise<void> {
    if (this.logoutPromise) return this.logoutPromise;
    ++this.generation;
    this.token = null;
    this.publish("anonymous");
    const pending = [this.refreshPromise, this.loginPromise].filter(
      (promise) => promise !== null,
    );
    const promise = Promise.allSettled(pending)
      .then(() =>
        request("/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: { "X-Refresh-Request": "true" },
        }),
      )
      .then(() => undefined)
      .finally(() => {
        if (this.logoutPromise === promise) this.logoutPromise = null;
      });
    this.logoutPromise = promise;
    return promise;
  }
}

export const session = new Session();


