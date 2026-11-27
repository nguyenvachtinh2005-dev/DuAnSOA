import { ApiResponse } from '../models';

export function wrapApiResponse<T>(data: T, message = 'OK'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}