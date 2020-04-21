/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const buildCategories = dataElementGroups =>
  Object.entries(dataElementGroups).map(([key, value]) => ({
    category: key,
    description: value.name,
  }));
