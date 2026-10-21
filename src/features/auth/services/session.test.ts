import { beforeEach, describe, expect, it, vi } from "vitest";
import { Session } from "./session";
import { ApiError } from "../../../shared/api/client";

const auth = {
  accessToken: "test-access",
  tokenType: "Bearer",
  expiresIn: 3600,
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}
function deferred() {
  let resolve: (response: Response) => void = () => {
    throw new Error("Promise not initialized");
  };
  const promise = new Promise<Response>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe("Session", () => {
  const fetchMock = vi.fn<typeof fetch>();
  let session: Session;
  beforeEach(() => {
    session = new Session();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  it("restores the session with the protected cookie and no bearer", async () => {
    fetchMock.mockResolvedValue(json(auth));
    await session.restore();
    expect(session.getSnapshot()).toBe("authenticated");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
      headers: { "X-Refresh-Request": "true" },
    });
  });
  it("treats missing refresh as an anonymous session", async () => {
    fetchMock.mockResolvedValue(json({ message: "Sessão expirada" }, 401));
    await session.restore();
    expect(session.getSnapshot()).toBe("anonymous");
  });
  it("keeps network failure distinct and permits restoration retry", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(json(auth));
    await session.restore();
    expect(session.getSnapshot()).toBe("unavailable");
    await session.restore();
    expect(session.getSnapshot()).toBe("authenticated");
  });
  it("shares one refresh for simultaneous requests", async () => {
    const pending = deferred();
    fetchMock.mockReturnValue(pending.promise);
    const first = session.refresh();
    const second = session.refresh();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    pending.resolve(json(auth));
    await Promise.all([first, second]);
    expect(session.getSnapshot()).toBe("authenticated");
  });
  it("refreshes simultaneous 401 responses once and retries with the new bearer", async () => {
    await login();
    const pending = deferred();
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json({}, 401))
      .mockReturnValueOnce(pending.promise)
      .mockImplementation(async () => json({ ok: true }));
    const first = session.authorized("/orders");
    const second = session.authorized("/orders");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    pending.resolve(json({ ...auth, accessToken: "renewed-access" }));
    await expect(Promise.all([first, second])).resolves.toEqual([
      { ok: true },
      { ok: true },
    ]);
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/auth/refresh"),
      ),
    ).toHaveLength(1);
    expect(fetchMock.mock.calls[4][1]?.headers).toMatchObject({
      Authorization: "Bearer renewed-access",
    });
  });
  it("never refreshes forbidden requests", async () => {
    await login();
    fetchMock.mockResolvedValue(json({}, 403));
    await expect(session.authorized("/orders")).rejects.toMatchObject({
      status: 403,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("invalidates the session after a second unauthorized response without looping", async () => {
    await login();
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json(auth))
      .mockResolvedValueOnce(json({}, 401));
    await expect(session.authorized("/orders")).rejects.toMatchObject({
      status: 401,
    });
    expect(session.getSnapshot()).toBe("anonymous");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it("does not allow a pending refresh to restore a logged out session", async () => {
    await login();
    const pending = deferred();
    fetchMock
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const refresh = session.refresh().catch((error) => error);
    const logout = session.logout();
    expect(session.getSnapshot()).toBe("anonymous");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    pending.resolve(json(auth));
    expect(await refresh).toBeInstanceOf(ApiError);
    await logout;
    expect(session.getSnapshot()).toBe("anonymous");
    expect(String(fetchMock.mock.calls[1][0])).toContain("/auth/logout");
  });
  it("waits for login before remote logout so cookies cannot reappear", async () => {
    const pending = deferred();
    fetchMock
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const loginRequest = session
      .login({ email: "person@example.test", password: "example123" })
      .catch((error) => error);
    const logout = session.logout();
    pending.resolve(json(auth));
    expect(await loginRequest).toBeInstanceOf(ApiError);
    await logout;
    expect(session.getSnapshot()).toBe("anonymous");
    expect(String(fetchMock.mock.calls[1][0])).toContain("/auth/logout");
  });
  it("does not clear a new login through an older logout request", async () => {
    await login();
    const pending = deferred();
    fetchMock
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(json(auth));
    const logout = session.logout();
    const newLogin = session.login({
      email: "other@example.test",
      password: "example123",
    });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    pending.resolve(new Response(null, { status: 204 }));
    await Promise.all([logout, newLogin]);
    expect(session.getSnapshot()).toBe("authenticated");
  });
  it("keeps the local session closed if remote logout fails", async () => {
    await login();
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await expect(session.logout()).rejects.toMatchObject({ status: 0 });
    expect(session.getSnapshot()).toBe("anonymous");
    await expect(session.authorized("/orders")).rejects.toMatchObject({
      status: 401,
    });
  });
  it("rejects malformed session data", async () => {
    fetchMock.mockResolvedValue(json({ accessToken: "incomplete" }));
    await expect(
      session.login({ email: "person@example.test", password: "example123" }),
    ).rejects.toMatchObject({ status: 502 });
    expect(session.getSnapshot()).not.toBe("authenticated");
  });
  it("reports connection failure even after previously becoming anonymous", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401));
    await session.restore();
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    await session.restore();
    expect(session.getSnapshot()).toBe("unavailable");
  });
  it("does not overwrite logout with a stale restoration failure", async () => {
    const pending = deferred();
    fetchMock.mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const restoration = session.restore();
    const logout = session.logout();
    pending.resolve(json({}, 503));
    await Promise.all([restoration, logout]);
    expect(session.getSnapshot()).toBe("anonymous");
  });
  async function login() {
    fetchMock.mockResolvedValueOnce(json(auth));
    await session.login({
      email: "person@example.test",
      password: "example123",
    });
    fetchMock.mockReset();
  }
});

