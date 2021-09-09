import { AggregationObject } from '../../../../types';

export function validateDataGroups(dataGroups: unknown): asserts dataGroups is [string] {
  if (!Array.isArray(dataGroups)) {
    throw new Error(`Expected an array with data group codes but got ${dataGroups}`);
  }
  if (dataGroups.length === 0) {
    throw new Error(`Expected data group codes but got empty array ${dataGroups}`);
  }
  dataGroups.forEach(dataGroupCode => {
    if (typeof dataGroupCode !== 'string') {
      throw new Error(`Expected the data group code to be a string, but got ${dataGroupCode}`);
    }
  });
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

  const nonStringDataElementCode = dataElements.find(param => typeof param !== 'string');
  if (nonStringDataElementCode) {
    throw new Error(
      `Expected all data element codes to be strings, but got ${nonStringDataElementCode}`,
    );
  }
}

export function validateAggregations(
  aggregations: unknown,
): asserts aggregations is undefined | (string | AggregationObject)[] {
  if (aggregations === undefined) {
    return;
  }

  if (!Array.isArray(aggregations)) {
    throw new Error(`Expected an array of aggregations but got ${aggregations}`);
  }

  aggregations.forEach(aggregation => {
    if (typeof aggregation === 'string') {
      return;
    }

    if (typeof aggregation === 'object') {
      return;
    }

    throw new Error(
      'Expected all aggregations to be either a string, or { type: string, config: object }',
    );
  });
}
