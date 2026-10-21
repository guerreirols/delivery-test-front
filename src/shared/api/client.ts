export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;
  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const baseUrl = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

export async function request(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, options);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError(
      0,
      "Não foi possível conectar. Verifique sua conexão e tente novamente.",
    );
  }
  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  if (!response.ok) {
    const fields: Record<string, string> = {};
    if (isRecord(body) && Array.isArray(body.fieldErrors)) {
      for (const field of body.fieldErrors) {
        if (
          isRecord(field) &&
          typeof field.field === "string" &&
          typeof field.message === "string"
        )
          fields[field.field] = field.message;
      }
    }
    const fallback =
      response.status >= 500
        ? "O serviço está indisponível. Tente novamente em instantes."
        : "Não foi possível concluir a solicitação.";
    const message =
      response.status < 500 &&
      isRecord(body) &&
      typeof body.message === "string"
        ? body.message
        : fallback;
    throw new ApiError(response.status, message, fields);
  }
  return body;
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Ocorreu um imprevisto. Tente novamente.";
}
