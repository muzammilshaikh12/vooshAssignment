// custom response
class ApiResponse {
  constructor(statusCode, message, data = null, error = null) {
    this.status = statusCode;
    this.message = message;
    this.data = data;
    this.error = error;
    this.success = (statusCode < 400) & (statusCode >= 200);
  }
}

// custom error-handling
class ApiError extends Error {
  constructor(status, message = "Internal Server Error") {
    super(message);
    this.status = status;
    this.message = message;
    this.success = status >= 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

// custom try-catch handling
const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      let message =
        error instanceof ApiError ? error.message : "Internal Server Error";
      let status = error instanceof ApiError ? error.status : 500;
      let success = error instanceof ApiError ? error.success : false;
      res.status(status).json({
        status,
        message,
        success,
      });
    }
  };
};

module.exports = {
  ApiError,
  ApiResponse,
  asyncHandler,
};
