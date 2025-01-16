export const hasContent = value => {
  if (value === undefined || value === null || value.length === 0) {
    return 'Should not be empty';
  }
  return null;
};
