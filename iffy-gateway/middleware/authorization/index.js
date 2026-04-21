const jwt = require("jsonwebtoken");
const catchErrors = require("../../errors/async-catch");
const { UserUnauthorizedError } = require("../../errors/custom-errors");

exports.verifyToken = catchErrors((req, res, next) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    throw new UserUnauthorizedError("Missing authorization header");
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UserUnauthorizedError("Invalid authorization header format");
  }

  if (!token) {
    throw new UserUnauthorizedError();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.headers["x-user-id"] = decoded.sub;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UserUnauthorizedError("Token has expired");
    }

    throw new UserUnauthorizedError("Invalid token");
  }

  next();
});
