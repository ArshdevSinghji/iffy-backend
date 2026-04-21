const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_PREFIX = "enc:v1";
const IV_LENGTH = 12;

const normalizeEnvValue = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const tryDecodeBase64 = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (!/^[A-Za-z0-9+/=]+$/.test(padded)) {
    return null;
  }

  const decoded = Buffer.from(padded, "base64");
  return decoded.length ? decoded : null;
};

const tryDecodeHex = (value) => {
  if (!/^[A-Fa-f0-9]+$/.test(value) || value.length % 2 !== 0) {
    return null;
  }

  const decoded = Buffer.from(value, "hex");
  return decoded.length ? decoded : null;
};

const getEncryptionKey = () => {
  const rawValue = process.env.CHAT_ENC_KEY_B64;
  const keyInput = normalizeEnvValue(rawValue);

  if (!keyInput) {
    throw new Error("CHAT_ENC_KEY_B64 is required for chat encryption");
  }

  const decodedKey =
    tryDecodeBase64(keyInput) ||
    tryDecodeHex(keyInput) ||
    Buffer.from(keyInput, "utf8");

  if (decodedKey.length !== 32) {
    throw new Error(
      `CHAT_ENC_KEY_B64 must resolve to 32 bytes for AES-256-GCM (resolved ${decodedKey.length} bytes)`,
    );
  }

  return decodedKey;
};

const isEncryptedText = (value) => {
  return typeof value === "string" && value.startsWith(`${ENCRYPTION_PREFIX}:`);
};

const encryptChatText = (plainText) => {
  if (typeof plainText !== "string") return plainText;
  if (!plainText.length) return plainText;
  if (isEncryptedText(plainText)) return plainText;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}:${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
};

const decryptChatText = (encryptedText) => {
  if (typeof encryptedText !== "string") return encryptedText;
  if (!isEncryptedText(encryptedText)) return encryptedText;

  const [prefixPart, versionPart, ivBase64, authTagBase64, cipherBase64] =
    encryptedText.split(":");

  if (
    prefixPart !== "enc" ||
    versionPart !== "v1" ||
    !ivBase64 ||
    !authTagBase64 ||
    !cipherBase64
  ) {
    return encryptedText;
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivBase64, "base64"),
  );

  decipher.setAuthTag(Buffer.from(authTagBase64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherBase64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

module.exports = {
  encryptChatText,
  decryptChatText,
  isEncryptedText,
};
