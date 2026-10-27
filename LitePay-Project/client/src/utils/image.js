export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return `${(process.env.REACT_APP_API_URL || '').replace('/api', '')}/uploads/default.jpg`;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return `${(process.env.REACT_APP_API_URL || '').replace('/api', '')}${imagePath}`;
  }
  return `${(process.env.REACT_APP_API_URL || '').replace('/api', '')}/uploads/${imagePath}`;
};
