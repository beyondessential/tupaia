/**
 * This is a utility function that returns the key to use when editing a field. This is useful because sometimes if the data is pre-filled from the api, the key of the data is different from the key that should be used when editing the field.
 */
export const getFieldEditKey = field => {
  const { source, editConfig = {} } = field;
  if (editConfig.optionsEndpoint) {
    if (editConfig.sourceKey) {
      return editConfig.sourceKey;
    }
    const sourceComponents = source.split('.');
    if (sourceComponents.length > 1) {
      const [resource] = sourceComponents;
      return `${resource}_id`;
    }
  }
  return source;
};
