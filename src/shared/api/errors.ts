export interface ApiErrorParams {
  code: string;
  message: string;
  correlationId: string;
  status: number;
  details?: Record<string, unknown>;
  retryable: boolean;
}

/** Mirrors the ErrorEnvelope shape from API_ERROR_CODES.md — every failure carries a stable `code` and a `correlationId` a user can quote. */
export class ApiError extends Error {
  readonly code: string;
  readonly correlationId: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;

  constructor(params: ApiErrorParams) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.correlationId = params.correlationId;
    this.status = params.status;
    this.details = params.details;
    this.retryable = params.retryable;
  }
}

interface ErrorEnvelopeBody {
  error?: {
    code: string;
    message: string;
    correlationId: string;
    details?: Record<string, unknown>;
    retryable: boolean;
  };
}

export async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as ErrorEnvelopeBody | null;

  if (body?.error) {
    return new ApiError({ ...body.error, status: response.status });
  }

  return new ApiError({
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again.",
    correlationId: response.headers.get("x-correlation-id") ?? "unknown",
    status: response.status,
    retryable: false,
  });
}
