import cloudinary from "../config/cloudinary";
import path from "path";

//upload un fichier Multer (en mémoire) vers Cloudinary et retourne l'URL sécurisée
export function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const isImage = file.mimetype.startsWith("image/");
    const ext = path.extname(file.originalname); // ex: ".pdf"
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 80);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `mentorsphere/${folder}`,
        resource_type: isImage ? "image" : "raw",
        ...(isImage
          ? {}
          : {
              // pour "raw", l'extension doit être DANS le public_id,
              // l'option "format" est ignorée par Cloudinary pour ce type
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