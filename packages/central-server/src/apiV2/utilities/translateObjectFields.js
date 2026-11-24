export const translateObjectFields = async (object, objectTranslators) => {
  await Promise.all(
    Object.entries(object).map(async ([field, value]) => {
      if (Object.hasOwn(objectTranslators, field)) {
        const newFields = await objectTranslators[field](value);
        delete object[field];
        for (const [newField, newValue] of Object.entries(newFields)) object[newField] = newValue;
      }
    }),
  );
};
