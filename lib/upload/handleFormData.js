import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Saves an image File (from request.formData()) under
 * /public/uploads/<subdir>/ and returns its relative path. Shared by
 * passport photo upload (Step 3) and face enrolment capture (Step 4).
 * This replaces Multer, which is Express-middleware-specific and doesn't
 * attach to Next.js API route handlers.
 *
 * @param {File} file
 * @param {string} subdir - e.g. "passports" or "faces"
 * @returns {Promise<string>} relative path, e.g. "/uploads/faces/xyz.jpg"
 */
export async function saveImage(file, subdir) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("No valid file was provided.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Image must be a JPEG, PNG, or WEBP file.");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image must be smaller than 3MB.");
  }

  const dir = path.join(UPLOADS_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${subdir}/${filename}`;
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function savePassportPhoto(file) {
  return saveImage(file, "passports");
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function saveFaceImage(file) {
  return saveImage(file, "faces");
}
