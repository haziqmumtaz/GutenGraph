import type { HttpError } from './errors.js';

export type Result<T> = Success<T> | Failure;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure {
  success: false;
  error: HttpError;
}

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const failure = (error: HttpError): Failure => ({
  success: false,
  error,
});

export const isSuccess = <T>(result: Result<T>): result is Success<T> => {
  return result.success === true;
};
