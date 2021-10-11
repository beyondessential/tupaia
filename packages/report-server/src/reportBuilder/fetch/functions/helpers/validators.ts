export function validateDataGroups(dataGroups: unknown): asserts dataGroups is [string] {
  if (!Array.isArray(dataGroups)) {
    throw new Error(`Expected an array with data group codes but got ${dataGroups}`);
  }
  if (dataGroups.length === 0) {
    throw new Error(`Expected data group codes but got empty array ${dataGroups}`);
  }
}

export function validateDataElementsForEvents(
  dataElements: unknown,
): asserts dataElements is undefined | string[] {
  if (dataElements === undefined) {
    return;
  }
  validateDataElementsForAnalytics(dataElements);
}

export function validateDataElementsForAnalytics(
  dataElements: unknown,
): asserts dataElements is string[] {
  if (!Array.isArray(dataElements)) {
    throw new Error(`Expected an array of data element codes but got ${dataElements}`);
  }
}
