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

class FirebaseTokenVerificationError extends CustomError {
  constructor(message = "Firebase token verification failed") {
    super(message, "FIREBASE_TOKEN_ERROR", 403);
  }
}

class UserUnauthorizedError extends CustomError {
  constructor(message = "User is unauthorized to perform this action") {
    super(message, "USER_UNAUTHORIZED", 401);
  }
}

class UpstreamServiceError extends CustomError {
  constructor(
    upstream = "UPSTREAM_SERVICE",
    status = 502,
    data = {},
    message = "Upstream service request failed",
  ) {
    super(message, "UPSTREAM_SERVICE_ERROR", status, {
      upstream,
      ...data,
    });
  }
}

module.exports = {
  CustomError,
  FirebaseTokenVerificationError,
  UserUnauthorizedError,
  UpstreamServiceError,
};
