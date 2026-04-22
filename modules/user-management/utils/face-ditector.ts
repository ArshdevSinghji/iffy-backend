import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-wasm";
import * as canvas from "canvas";
import path from "path";
import sharp from "sharp";

const faceapi = require("@vladmandic/face-api/dist/face-api.node-wasm.js");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let isLoaded = false;
let tfReadyPromise: Promise<void> | undefined;
let modelLoadPromise: Promise<void> | undefined;

const FACE_MIN_CONFIDENCE = Number(process.env.FACE_MIN_CONFIDENCE || 0.8);
const FACE_MIN_RELATIVE_AREA = Number(
  process.env.FACE_MIN_RELATIVE_AREA || 0.05,
);

const ensureTfReady = async () => {
  if (!tfReadyPromise) {
    tfReadyPromise = (async () => {
      await tf.setBackend("wasm");
      await tf.ready();
    })();
  }

  await tfReadyPromise;
};

const loadModels = async () => {
  if (isLoaded) {
    return;
  }

  await ensureTfReady();

  if (!modelLoadPromise) {
    modelLoadPromise = (async () => {
      const modelPath = path.join(__dirname, "../weights");
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
      isLoaded = true;
    })();
  }

  await modelLoadPromise;
};

export const detectFace = async (buffer: Buffer): Promise<boolean> => {
  await loadModels();

  try {
    const compatibleBuffer = await sharp(buffer).png().toBuffer();
    const img = await canvas.loadImage(compatibleBuffer);
    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.SsdMobilenetv1Options({ minConfidence: FACE_MIN_CONFIDENCE }),
    );

    const imageArea = img.width * img.height;
    const validDetections = detections.filter((detection: any) => {
      const { score, box } = detection;
      const relativeArea = (box.width * box.height) / imageArea;

      return (
        score >= FACE_MIN_CONFIDENCE && relativeArea >= FACE_MIN_RELATIVE_AREA
      );
    });

    return validDetections.length > 0;
  } catch (error) {
    console.error("Face detection failed:", error);
    return true;
  }
};
