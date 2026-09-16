import multer from "multer";

const storage = multer.diskStorage({});

const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (_req, file, callback) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            callback(null, true);
        } else {
            callback(new Error('Only JPEG and PNG images are supported'));
        }
    },
})

export default upload;
