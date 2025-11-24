class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Add a message
    this.code = errorCode || 500; // Adds a status code
  }
}

module.exports = HttpError;
