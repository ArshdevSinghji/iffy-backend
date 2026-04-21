const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

function normalizePrivateKey(value) {
  if (!value) return value;
  return value.replace(/\\n/g, "\n");
}

function loadServiceAccountFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return {
      ...parsed,
      private_key: normalizePrivateKey(parsed.private_key),
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: normalizePrivateKey(privateKey),
    };
  }

  return null;
}

const serviceAccount = loadServiceAccountFromEnv();

if (!serviceAccount) {
  throw new Error(
    "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.",
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Verify Firebase ID token and extract firebaseUid
 * @param {String} token - Firebase ID token from client
 * @returns {Promise<Object>} { firebaseUid, claims }
 */
async function verifyFirebaseTokenService(token) {
  const decodedToken = await admin.auth().verifyIdToken(token);
  return {
    uid: decodedToken.uid,
  };
}

async function deleteFirebaseUserService(uid) {
  await admin.auth().deleteUser(uid);
}

function createCustomToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
}

module.exports = {
  verifyFirebaseTokenService,
  deleteFirebaseUserService,
  createCustomToken,
};
