// controllers/fileUpload.controller.js
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const getAllFile = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const result = await cloudinary.api.resources({
        resource_type: 'upload',
        prefix: 'social-media-app/files/',
        max_results: 100,
      });
      const files = result.resources.map(f => ({
        public_id: f.public_id,
        url: f.secure_url,
        format: f.format,
      }));
      res.json(files);
    } catch (err) {
      res.status(500).send("Failed to list files");
    }
  } else {
    const dir = path.join(__dirname, '..', 'uploads', 'files');
    fs.readdir(dir, (err, files) => {
      if (err) return res.status(500).send("Error reading directory");
      res.json(files.map(f => ({ url: `/uploads/files/${f}` })));
    });
  }
};

const downloadFile = async (req, res) => {
  const filename = req.params.filename;
  if (process.env.NODE_ENV === 'production') {
    res.redirect(cloudinary.url(filename, { secure: true }));
  } else {
    const filePath = path.join(__dirname, '..', 'uploads', 'files', filename);
    res.download(filePath);
  }
};

const deleteFile = async (req, res) => {
  const filename = req.params.filename;
  if (process.env.NODE_ENV === 'production') {
    try {
      await cloudinary.uploader.destroy(filename);
      res.send("File Deleted Successfully");
    } catch (err) {
      res.status(500).send("Failed to delete");
    }
  } else {
    const filePath = path.join(__dirname, '..', 'uploads', 'files', filename);
    fs.unlink(filePath, () => res.send("File Deleted"));
  }
};

exports.getAllFile = getAllFile;
exports.downloadFile = downloadFile;
exports.deleteFile = deleteFile;
