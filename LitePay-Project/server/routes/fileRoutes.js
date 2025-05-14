const express = require('express');
const router = express.Router();
const { checkFileExists } = require('../middlewares/fileCheck');

router.get('/:filename', checkFileExists, (req, res) => {
  res.sendFile(req.params.filename, { 
    root: './uploads',
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

module.exports = router;