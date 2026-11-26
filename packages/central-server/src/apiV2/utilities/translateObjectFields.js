export const translateObjectFields = async (object, objectTranslators) => {
  await Promise.all(
    Object.entries(object).map(async ([field, value]) => {
      const translator = Object.hasOwn(objectTranslators, field)
        ? objectTranslators[field]
        : undefined;
      if (typeof translator === 'function') {
        const newFields = await translator(value);
        delete object[field];
        for (const [newField, newValue] of Object.entries(newFields)) object[newField] = newValue;
      }
    }),
  );
};
