import cloudinary from "../config/cloudinary";

//upload un fichier Multer (en mémoire) vers Cloudinary et retourne l'URL sécurisée
export function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const isImage = file.mimetype.startsWith("image/");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `mentorsphere/${folder}`,
        resource_type: isImage ? "image" : "raw",
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