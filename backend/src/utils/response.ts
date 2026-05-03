export function ok<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    meta: message ? { message } : undefined,
  };
}

export function fail(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    error: {
      code,
      message,
      details,
    },
  };
}
