import cloudinary from "../config/cloudinary";
import path from "path";

//upload un fichier Multer (en mémoire) vers Cloudinary et retourne l'URL sécurisée
export function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const resourceType = getCloudinaryResourceType(file.mimetype);
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 80);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `mentorsphere/${folder}`,
        resource_type: resourceType,
        ...(resourceType === "image"
          ? {}
          : {
              // pour "raw" ET "video", l'extension doit être DANS le public_id
              public_id: `${baseName}-${Date.now()}${ext}`,
            }),
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Échec de l'upload Cloudinary"));
        }
        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
}

function getCloudinaryResourceType(mimetype: string): "image" | "video" | "raw" {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
}