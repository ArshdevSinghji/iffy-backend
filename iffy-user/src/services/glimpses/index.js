const sharp = require("sharp");
const { detectFace } = require("../../utils/face-ditector");
const { BadRequest, GlimpseNotFound } = require("../../errors/custom-errors");
const { uploadToR2 } = require("../../utils/r2-storage");
const { glimpseRepository } = require("../../repositories");

async function getGlimpsesService(payload) {
  const { userID } = payload.params;
  return await glimpseRepository.findGlimpses(userID);
}

async function createGlimpseService(payload) {
  const { userID } = payload.params;
  const { caption } = payload.body;
  const imageBuffer = payload.file.buffer;

  const hasFace = await detectFace(imageBuffer);
  if (hasFace) {
    throw new BadRequest("Image contains a face, which is not allowed.");
  }

  const optimizedBuffer = await sharp(imageBuffer)
    .resize(1080, 1350, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 80 })
    .toBuffer();

  const fileName = `glimpses/${userID}-${Date.now()}.webp`;
  const imageURL = await uploadToR2(optimizedBuffer, fileName);

  const payloadToDB = {
    userID,
    caption,
    imageURL,
  };

  return await glimpseRepository.createGlimpse(payloadToDB);
}

async function deleteGlimpseService(payload) {
  const { userID, glimpseID } = payload.params;

  const glimpse = await glimpseRepository.findGlimpseById(userID, glimpseID);
  if (!glimpse) {
    throw new BadRequest("Glimpse not found.");
  }

  return await glimpseRepository.deleteGlimpse(userID, glimpseID);
}

module.exports = {
  getGlimpsesService,
  createGlimpseService,
  deleteGlimpseService,
};
