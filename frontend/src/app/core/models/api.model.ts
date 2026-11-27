export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
}