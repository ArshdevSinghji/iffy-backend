const { BadRequest } = require("../errors/custom-errors");

const formatIssues = (issues = []) => {
  if (!issues.length) {
    return "Invalid request data";
  }

  return issues
    .map((issue) => {
      const path = issue.path?.length ? issue.path.join(".") : "request";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
};

const validate = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse({
      params: req.params || {},
      query: req.query || {},
      body: req.body || {},
    });

    if (!result.success) {
      return next(new BadRequest(formatIssues(result.error.issues)));
    }

    req.params = result.data.params;
    req.query = result.data.query;
    req.body = result.data.body;

    return next();
  };
};

const requireFile = (req, _res, next) => {
  if (!req.file) {
    return next(new BadRequest("File is required"));
  }

  return next();
};

module.exports = {
  validate,
  requireFile,
};
