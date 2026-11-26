export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

interface ValidationError {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: ValidationError[] | null;
  data?: any;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: ValidationError[];
      data?: any;
    };
  };
  message?: string;
}

export interface BackendResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface BackendError {
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export const successResponse = <T>(
  response: BackendResponse<T>
): SuccessResponse<T> => {
  return {
    success: true,
    message: response.message,
    data: response.data,
  };
};

export const errorResponse = (
  error: ApiError
): ErrorResponse => {
  return {
    success: false,
    message:
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong.",
    errors: error?.response?.data?.errors ?? null,
    data: error?.response?.data?.data,
  };
};
