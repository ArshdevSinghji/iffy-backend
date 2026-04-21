const { pick } = require("lodash");
const { CustomError } = require("../../errors/custom-errors");

exports.handleError = (error, _req, res, _next) => {
  console.error(error);

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
