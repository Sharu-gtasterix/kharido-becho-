type MaybeString = string | null | undefined;

const sanitizeMessage = (message: string): string => {
  const trimmed = message.trim();
  if (!trimmed) {
    return trimmed;
  }

  const withoutUnexpected = trimmed.replace(/^an unexpected error occurred:?\s*/i, '').trim();
  if (withoutUnexpected.length > 0) {
    return withoutUnexpected;
  }

  return trimmed;
};

const firstNonEmpty = (...candidates: MaybeString[]): string | undefined => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const cleaned = candidate.trim();
      if (cleaned.length > 0) {
        return cleaned;
      }
    }
  }
  return undefined;
};

export const getFriendlyApiError = (error: any, fallback?: string): string => {
  if (!error) {
    return fallback ?? 'Something went wrong. Please try again.';
  }

  const data = error?.response?.data ?? {};
  const errorCode =
    typeof data?.errorCode === 'string' && data.errorCode.trim().length > 0
      ? data.errorCode.trim()
      : undefined;

  const nestedMessage =
    typeof data === 'object' && data !== null
      ? firstNonEmpty(
          (data as any).errorMessage,
          (data as any).message,
          (data as any).error?.message,
          (data as any).details,
        )
      : undefined;

  const candidate = firstNonEmpty(
    nestedMessage,
    error?.errorMessage,
    error?.message,
  );

  if (candidate) {
    const sanitized = sanitizeMessage(candidate);
    if (sanitized && !/^an unexpected error occurred$/i.test(sanitized)) {
      return sanitized;
    }
  }

  const baseMessage = fallback ?? 'Something went wrong. Please try again.';
  if (errorCode) {
    return `${baseMessage} (Error code: ${errorCode}). If this keeps happening, please contact support with this code.`;
  }

  return `${baseMessage} If this keeps happening, please contact support.`;
};

export default getFriendlyApiError;
