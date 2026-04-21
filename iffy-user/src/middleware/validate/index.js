const { BadRequest } = require("../../errors/custom-errors");

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    params: req.params,
    query: req.query,
    body: req.body,
  });

  if (!result.success) {
    const message = result.error.issues
      .map((e) => {
        const field = e.path.slice(1).join(".") || e.path.join(".");
        return field ? `${field}: ${e.message}` : e.message;
      })
      .join("; ");
    return next(new BadRequest(message));
  }

  next();
};

exports.validate = validate;

exports.requireFile = (req, _res, next) => {
  if (!req.file) {
    return next(new BadRequest("image file is required"));
  }
  next();
};
