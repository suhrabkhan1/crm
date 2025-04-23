import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

// Ensure upload directories exist
const mediaDir = path.join(process.cwd(), 'public', 'media');
const imagesDir = path.join(mediaDir, 'images');
const videosDir = path.join(mediaDir, 'videos');

// Create directories if they don't exist
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else {
      cb(new Error('Unsupported file type'), '');
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent collisions
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${extension}`);
  }
});

// Create file filter to only allow images and videos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and videos only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'));
  }
};

// Configure upload limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB max file size
};

// Create upload middleware
export const upload = multer({ 
  storage, 
  fileFilter,
  limits
});

// Error handling middleware for multer
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size limit is 10MB'
      });
    }
    return res.status(400).json({
      error: err.message,
      code: err.code
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({
      error: err.message
    });
  }
  
  // No error occurred, call next middleware
  next();
};

// Helper to get public URL for uploaded file
export const getFileUrl = (file: Express.Multer.File): string => {
  if (!file) return '';
  
  const relativePath = file.path.split('public')[1].replace(/\\/g, '/');
  return relativePath;
};