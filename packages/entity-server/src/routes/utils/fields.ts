const isSupported = <T extends string>(field: string, supportedFields: T[]): field is T =>
  (supportedFields as string[]).includes(field);

export const extractFieldFromQuery = <T extends string>(
  queryField: string | undefined,
  supportedFields: T[],
) => {
  if (!queryField) {
    return undefined;
  }

  if (isSupported(queryField, supportedFields)) {
    return queryField;
  }

  throw new Error(
    `Invalid single field requested ${queryField}, must be one of: ${supportedFields}`,
  );
};

export const extractFieldsFromQuery = <T extends string>(
  queryFields: string | undefined,
  supportedFields: T[],
) => {
  if (!queryFields) {
    return supportedFields; // Use all fields if none specifically requested
  }

  const requestedFields = queryFields.split(',');
  const fields = new Set<T>();
  requestedFields.forEach(requestedField => {
    if (isSupported(requestedField, supportedFields)) {
      fields.add(requestedField);
    } else {
      throw new Error(
        `Unknown field requested: ${requestedField}, must be one of: ${supportedFields}`,
      );
    }
  });
  return Array.from(fields);
};
