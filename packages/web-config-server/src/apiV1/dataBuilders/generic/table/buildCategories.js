export const buildCategories = dataElementGroups =>
  Object.entries(dataElementGroups).map(([key, value]) => ({
    category: key,
    description: value.name,
  }));
