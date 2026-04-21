class CustomError extends Error {
  constructor(message, code = "INTERNAL_ERROR", status = 500, data = {}) {
    super(message);
    this.message = message;
    this.code = code;
    this.status = status;
    this.data = data;
    this.name = this.constructor.name;
  }
}

class Unauthorized extends CustomError {
  constructor(message = "User is unauthorized to perform this action") {
    super(message, "USER_UNAUTHORIZED", 401);
  }
}

class UserNotFound extends CustomError {
  constructor(message = "User not found") {
    super(message, "USER_NOT_FOUND", 404);
  }
}

class PromptNotFound extends CustomError {
  constructor(message = "Prompt not found") {
    super(message, "PROMPT_NOT_FOUND", 404);
  }
}

class BadRequest extends CustomError {
  constructor(message = "Invalid request data", data = {}) {
    super(message, "BAD_REQUEST", 400, data);
  }
}

module.exports = {
  CustomError,
  BadRequest,
  Unauthorized,
  UserNotFound,
  PromptNotFound,
};
