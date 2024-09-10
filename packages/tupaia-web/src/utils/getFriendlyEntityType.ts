/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export const getFriendlyEntityType = entityType => {
  if (!entityType) return '';

  return entityType.toLowerCase().replace('_', '-');
};
