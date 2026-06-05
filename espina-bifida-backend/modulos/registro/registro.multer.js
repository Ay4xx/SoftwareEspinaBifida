import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadPaso5 = upload.fields([
  { name: "foto",                    maxCount: 1 },
  { name: "docPreregistro",          maxCount: 1 },
  { name: "docActaNacimiento",       maxCount: 1 },
  { name: "docCurp",                 maxCount: 1 },
  { name: "docComprobanteDomicilio", maxCount: 1 },
  { name: "docIneFamilia",           maxCount: 1 },
]);
