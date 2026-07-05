const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');

const localUploadDir = path.join(__dirname, '../../public/uploads');
const tempUploadDir = path.join(os.tmpdir(), 'mary-mother-cms-uploads');
const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || 'mary-mother-cms';
const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);
const uploadDir = cloudinaryEnabled ? tempUploadDir : localUploadDir;

fs.mkdirSync(localUploadDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
let cloudinaryClient = null;

function getCloudinaryClient() {
  if (!cloudinaryEnabled) return null;
  if (cloudinaryClient) return cloudinaryClient;

  cloudinaryClient = require('cloudinary').v2;
  if (!process.env.CLOUDINARY_URL) {
    cloudinaryClient.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  } else {
    cloudinaryClient.config({ secure: true });
  }

  return cloudinaryClient;
}

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
    const optimizedPath = path.join(parsed.dir, `${parsed.name}-optimized.jpg`);

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

  if (cloudinaryEnabled) {
    try {
      const result = await getCloudinaryClient().uploader.upload(req.file.path, {
        folder: cloudinaryFolder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false
      });

      req.file.publicPath = result.secure_url;
      req.file.cloudinaryPublicId = result.public_id;
      fs.unlink(req.file.path, () => {});
    } catch (error) {
      fs.unlink(req.file.path, () => {});
      return next(error);
    }
  }

  return next();
}

function publicUploadPath(file) {
  if (!file) return null;
  return file.publicPath || `/uploads/${file.filename}`;
}

function cloudNameFromEnv() {
  if (process.env.CLOUDINARY_CLOUD_NAME) return process.env.CLOUDINARY_CLOUD_NAME;
  if (!process.env.CLOUDINARY_URL) return null;

  try {
    return new URL(process.env.CLOUDINARY_URL).hostname;
  } catch (error) {
    return null;
  }
}

function cloudinaryPublicIdFromUrl(publicPath) {
  try {
    const url = new URL(publicPath);
    const cloudName = cloudNameFromEnv();
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname !== 'res.cloudinary.com' || parts[0] !== cloudName) return null;

    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    let publicIdParts = parts.slice(uploadIndex + 1);
    const versionIndex = publicIdParts.findIndex((part) => /^v\d+$/.test(part));
    if (versionIndex >= 0) {
      publicIdParts = publicIdParts.slice(versionIndex + 1);
    }

    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');
    return publicId || null;
  } catch (error) {
    return null;
  }
}

function removeUploadedFile(publicPath) {
  if (!publicPath) return;

  if (publicPath.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '../../public', publicPath);
    fs.unlink(filePath, () => {});
    return;
  }

  const publicId = cloudinaryPublicIdFromUrl(publicPath);
  if (publicId && cloudinaryEnabled) {
    getCloudinaryClient().uploader.destroy(publicId, { resource_type: 'image' }).catch((error) => {
      console.warn('Cloudinary cleanup skipped:', error.message);
    });
  }
}

module.exports = {
  uploadImage,
  optimizeImage,
  publicUploadPath,
  removeUploadedFile
};
