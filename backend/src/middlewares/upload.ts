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

//stockage en mémoire dédié aux ressources (limite plus haute, filtre par type)
const RESOURCE_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo

const resourceStorage = multer.memoryStorage();

export const uploadResourceFile = multer({
  storage: resourceStorage,
  limits: { fileSize: RESOURCE_MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
    ];
    if (req.body.type === "DOCUMENT" && !allowed.includes(file.mimetype)) {
      return cb(new Error("Format de document non supporté."));
    }
    cb(null, true);
  },
}).single("file");