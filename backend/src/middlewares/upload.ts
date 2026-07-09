import multer from "multer";

//stockage en mémoire
const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

//champs attendus pour le wizard mentor
export const uploadMentorProfileFiles = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "cv", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

//champs attendus pour le wizard entrepreneur
export const uploadEntrepreneurProfileFiles = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "cv", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);