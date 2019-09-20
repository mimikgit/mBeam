export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFound';
    this.message = message;
  }
}

export class ParameterError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Parameter';
    this.message = message;
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Forbidden';
    this.message = message;
  }
}
