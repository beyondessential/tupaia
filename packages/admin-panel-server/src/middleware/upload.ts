import multer from 'multer';

export const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, callback) => {
      callback(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});
