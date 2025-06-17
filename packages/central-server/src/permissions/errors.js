export class InsufficientPermissionsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsufficientPermissionsError';
  }
}
