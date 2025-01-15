export const capitalizeFirst = str => str?.[0].toUpperCase() + str?.slice(1);

export const getPluralForm = resourceName => {
  if (!resourceName) return null;
  const { singular, plural } = resourceName;
  return plural ?? `${singular}s`;
};

export const generateTitle = resourceName => capitalizeFirst(getPluralForm(resourceName));
