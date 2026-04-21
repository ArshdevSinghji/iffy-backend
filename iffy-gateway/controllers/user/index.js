const catchErrors = require("../../errors/async-catch");
const { authService, httpService } = require("../../service");
require("dotenv").config();

exports.getDiscovery = catchErrors(async (req, res) => {
  const userID = req.headers["x-user-id"];
  const { age_range, distance, limit, page } = req.query;
  const response = await httpService.request(
    {
      method: "get",
      url: `${process.env.USER_SERVICE_URL}/users`,
      params: {
        userID,
        age_range,
        distance,
        limit,
        page,
      },
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.getProfile = catchErrors(async (req, res) => {
  const id = req.headers["x-user-id"];
  const { fields = "" } = req.query;
  const response = await httpService.request(
    {
      method: "get",
      url: `${process.env.USER_SERVICE_URL}/users/${id}`,
      params: { fields },
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.deleteProfile = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const firebaseUid = req.user.firebaseUid;

  const response = await httpService.request(
    {
      method: "delete",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}`,
    },
    { upstreamName: "USER_SERVICE" },
  );

  await authService.deleteFirebaseUserService(firebaseUid);

  res.status(response.status).send(response.data);
});

exports.updateProfile = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const body = req.body;
  const response = await httpService.request(
    {
      method: "put",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}`,
      data: body,
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.getLikers = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const response = await httpService.request(
    {
      method: "get",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}/likers`,
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.getGlimpses = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const response = await httpService.request(
    {
      method: "get",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}/glimpses`,
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});

exports.createGlimpse = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const userServiceHost = new URL(process.env.USER_SERVICE_URL).host;
  const { host, connection, ...forwardHeaders } = req.headers;

  const response = await httpService.request(
    {
      method: "post",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}/glimpses`,
      data: req,
      headers: {
        ...forwardHeaders,
        host: userServiceHost,
        "x-user-id": userId,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    },
    { upstreamName: "USER_SERVICE" },
  );

  return res.status(response.status).send(response.data);
});

exports.deleteGlimpse = catchErrors(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const glimpseId = req.params.glimpseId;
  const response = await httpService.request(
    {
      method: "delete",
      url: `${process.env.USER_SERVICE_URL}/users/${userId}/glimpses/${glimpseId}`,
    },
    { upstreamName: "USER_SERVICE" },
  );

  res.status(response.status).send(response.data);
});
