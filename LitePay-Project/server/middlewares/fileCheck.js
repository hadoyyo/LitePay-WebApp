const path = require('path');
const fs = require('fs');

exports.checkDefaultImage = (req, res, next) => {
  const defaultPath = path.join(__dirname, '../uploads/default.jpg');
  if (!fs.existsSync(defaultPath)) {
    fs.copyFileSync(
      path.join(__dirname, '../assets/default.jpg'),
      defaultPath
    );
  }
  next();
};