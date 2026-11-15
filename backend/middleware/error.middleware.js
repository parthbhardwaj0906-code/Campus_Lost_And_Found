const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image is too large. Please select an image under 25 MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message
  });
};

export default errorHandler;
