const { pick } = require("lodash");
const {
  CustomError,
  FirebaseTokenVerificationError,
} = require("../../errors/custom-errors");

exports.handleError = (error, _req, res, _next) => {
  console.error(error);

  if (
    error.errorInfo &&
    error.errorInfo.code &&
    error.errorInfo.code.startsWith("auth/")
  ) {
    error = new FirebaseTokenVerificationError();
  }

  if (
    error instanceof CustomError &&
    error.code === "UPSTREAM_SERVICE_ERROR" &&
    error.data &&
    typeof error.data === "object" &&
    error.data.error &&
    typeof error.data.error === "object"
  ) {
    const upstreamError = error.data.error;
    error = new CustomError(
      upstreamError.message || error.message,
      upstreamError.code || error.code,
      Number(upstreamError.status || error.status || 500),
      upstreamError.data || {},
    );
  }

  const isErrorSafeForClient = error instanceof CustomError;

  const clientError = isErrorSafeForClient
    ? pick(error, ["message", "code", "status", "data"])
    : {
        message: "Something went wrong.",
        code: "INTERNAL_ERROR",
        status: 500,
        data: {},
      };

  res.status(clientError.status).send({ error: clientError });
};
