/**
 * @description Entity types are stored as strings with '_' separating words. This function converts it to a human-readable format.
 */
export const getFriendlyEntityType = entityType => {
  if (!entityType) return '';

  return entityType.toLowerCase().replace('_', '-');
};
