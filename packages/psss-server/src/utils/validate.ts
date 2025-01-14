export const validateIsNumber = (
  value: unknown,
  errorHandler: (value: unknown) => Error,
): number => {
  if (typeof value !== 'number') {
    throw errorHandler(value);
  }

  return value;
};
