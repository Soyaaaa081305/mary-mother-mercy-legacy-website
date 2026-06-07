const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../../public/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/-+/g, '-');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    callback(null, uniqueName);
  }
});

const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('Only JPG, PNG, WEBP, and GIF image uploads are allowed.'));
    }
    return callback(null, true);
  }
});

async function optimizeImage(req, res, next) {
  if (!req.file) return next();

  try {
    const sharp = require('sharp');
    const parsed = path.parse(req.file.path);
    const optimizedPath = path.join(parsed.dir, `${parsed.name}.jpg`);

    await sharp(req.file.path)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(optimizedPath);

    if (optimizedPath !== req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    req.file.filename = path.basename(optimizedPath);
    req.file.path = optimizedPath;
    req.file.mimetype = 'image/jpeg';
  } catch (error) {
    console.warn('Image compression skipped:', error.message);
  }

  return next();
}

function publicUploadPath(file) {
  return file ? `/uploads/${file.filename}` : null;
}

function removeUploadedFile(publicPath) {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const filePath = path.join(__dirname, '../../public', publicPath);
  fs.unlink(filePath, () => {});
}

module.exports = {
  uploadImage,
  optimizeImage,
  publicUploadPath,
  removeUploadedFile
};

