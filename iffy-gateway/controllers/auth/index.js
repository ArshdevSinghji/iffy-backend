const { authService } = require("../../service");
const { httpService } = require("../../service");
const {
  FirebaseTokenVerificationError,
} = require("../../errors/custom-errors");
const catchErrors = require("../../errors/async-catch");

require("dotenv").config();

exports.auth = catchErrors(async (req, res) => {
  const { accessToken } = req.body;

  const user = await authService.verifyFirebaseTokenService(accessToken);
  if (!user) {
    throw new FirebaseTokenVerificationError();
  }
  const userID = user.uid;

  const userResponse = await httpService.request(
    {
      method: "post",
      url: `${process.env.USER_SERVICE_URL}/users`,
      data: { uid: userID },
    },
    { upstreamName: "USER_SERVICE" },
  );
  const data = userResponse.data;

  const payload = {
    sub: data._id,
    firebaseUid: userID,
    isProfileComplete: data.isProfileComplete,
  };

  const customToken = authService.createCustomToken(payload);

  const response = {
    uid: data._id,
    token: customToken,
  };

  res.status(200).send(response);
});
