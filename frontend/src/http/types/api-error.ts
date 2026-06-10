export type ApiErrorPayload = {
  code: string;
  message: string;
};

export type ApiErrorResponse = {
  error: ApiErrorPayload;
};

export type ApiSuccessResponse<T> = {
  data: T;
};
