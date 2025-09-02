export interface HttpError {
  status: number;
  error: string;
  message: string;
}

export const createHttpError = (
  status: number,
  error: string,
  message: string
): HttpError => ({
  status,
  error,
  message,
});

// Common HTTP error creators
export const badRequest = (message: string): HttpError =>
  createHttpError(400, 'Bad Request', message);

export const notFound = (message: string): HttpError =>
  createHttpError(404, 'Not Found', message);

export const internalServerError = (message: string): HttpError =>
  createHttpError(500, 'Internal Server Error', message);

export const serviceUnavailable = (message: string): HttpError =>
  createHttpError(503, 'Service Unavailable', message);

export const isApplicationError = (error: unknown): error is HttpError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'error' in error &&
    'message' in error
  );
};

export const toApplicationError = (error: unknown): HttpError => {
  if (isApplicationError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return internalServerError(error.message);
  }

  return internalServerError('Unknown error occurred');
};
