const catchErrors = (requestHandler) => {
    return async (req, res, next) => {
    try {
      return await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

}

module.exports = catchErrors;