const axios = require("axios");
const {
  CustomError,
  UpstreamServiceError,
} = require("../../errors/custom-errors");

const DEFAULT_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS || 8000);
const RETRY_ATTEMPTS = Number(process.env.UPSTREAM_RETRY_ATTEMPTS || 2);
const RETRY_DELAY_MS = Number(process.env.UPSTREAM_RETRY_DELAY_MS || 250);

const RETRYABLE_METHODS = new Set(["get", "put", "delete", "head", "options"]);

const client = axios.create({
  timeout: DEFAULT_TIMEOUT_MS,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error, method, attempt) {
  const normalizedMethod = String(method || "get").toLowerCase();
  if (!RETRYABLE_METHODS.has(normalizedMethod)) {
    return false;
  }

  if (attempt >= RETRY_ATTEMPTS) {
    return false;
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return error.response.status >= 500;
}

function toUpstreamServiceError(error, upstreamName = "UPSTREAM_SERVICE") {
  if (error.response) {
    const upstreamStatus = error.response.status;
    const upstreamData = error.response.data;

    // Preserve upstream error contract when upstream already returns
    // { error: { message, code, status, data } }.
    if (
      upstreamData &&
      typeof upstreamData === "object" &&
      upstreamData.error &&
      typeof upstreamData.error === "object"
    ) {
      const normalizedError = upstreamData.error;
      throw new CustomError(
        normalizedError.message || "Upstream service request failed",
        normalizedError.code || "UPSTREAM_SERVICE_ERROR",
        Number(normalizedError.status || upstreamStatus || 502),
        normalizedError.data || {},
      );
    }

    // Also support upstreams that directly return { message, code, status, data }.
    if (
      upstreamData &&
      typeof upstreamData === "object" &&
      upstreamData.message &&
      upstreamData.code
    ) {
      throw new CustomError(
        upstreamData.message,
        upstreamData.code,
        Number(upstreamData.status || upstreamStatus || 502),
        upstreamData.data || {},
      );
    }

    throw new UpstreamServiceError(upstreamName, upstreamStatus, upstreamData);
  }

  throw new UpstreamServiceError(upstreamName, 503, {
    reason: error.code || "UNREACHABLE",
    message: error.message,
  });
}

async function request(config, options = {}) {
  const upstreamName = options.upstreamName;
  let attempt = 0;

  while (true) {
    try {
      return await client.request(config);
    } catch (error) {
      const method = config.method || "get";
      if (!shouldRetry(error, method, attempt)) {
        toUpstreamServiceError(error, upstreamName);
      }

      attempt += 1;
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
}

module.exports = {
  request,
};
