export interface ApiSuccess<T> {
  success: true;
  data: T;
  requestId?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: ApiFieldError[];
  };
  requestId?: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
