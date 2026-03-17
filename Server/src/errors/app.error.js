class AppError extends Error {
  constructor(name, message, explanation, statusCode) {
    super(message);
    this.name = name;
    this.explanation = explanation;
    this.statusCode = statusCode;
  }
}

export default AppError;