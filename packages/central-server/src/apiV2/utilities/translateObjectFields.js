export const translateObjectFields = async (object, objectTranslators) => {
  await Promise.all(
    Object.entries(object).map(async ([field, value]) => {
      if (objectTranslators[field]) {
        const newFields = await objectTranslators[field](value);
        delete object[field];
        Object.entries(newFields).forEach(([newField, newValue]) => (object[newField] = newValue));
      }
    }),
  );
};
