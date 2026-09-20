export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }

  toJSON() {
    return { error: { code: this.code, message: this.message } };
  }
}

export const badRequest = (message) => new ApiError(400, 'BAD_REQUEST', message);
export const unauthorized = () => new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid API key');
export const tooManyKeys = (message) => new ApiError(422, 'TOO_MANY_KEYS', message);
