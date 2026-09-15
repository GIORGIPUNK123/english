export const getErrorMessage = (
  err: unknown,
  fallback = 'Something went wrong',
): string => {
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof err.message === 'string'
  ) {
    return err.message;
  }

  return fallback;
};

export const getFirebaseErrorCode = (err: unknown): string => {
  if (err && typeof err === 'object' && 'code' in err) {
    return String(err.code).replace(/^functions\//, '');
  }

  return '';
};

export const getFirebaseErrorMessage = (
  err: unknown,
  messages: Record<string, string>,
  fallback = 'Something went wrong',
): string => {
  const code = getFirebaseErrorCode(err);
  if (code && messages[code]) {
    return messages[code];
  }

  return getErrorMessage(err, fallback);
};
