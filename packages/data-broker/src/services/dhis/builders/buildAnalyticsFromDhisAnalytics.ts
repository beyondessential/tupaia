import { getSortByKey, reduceToDictionary } from '@tupaia/utils';
import { Analytic, RawAnalyticResults } from '../../../types';
import { AnalyticDimension, DhisAnalytics, ValueType } from '../types';
import { sanitizeValue } from './sanitizeValue';

const DIMENSION_TRANSLATION: Partial<Record<AnalyticDimension, keyof Analytic>> = {
  dx: 'dataElement',
  ou: 'organisationUnit',
  pe: 'period',
  value: 'value',
};

const DIMENSION_TYPES = {
  DATA_ELEMENT: 'DATA_ELEMENT',
};

type ColumnSpec = {
  dimension: keyof Analytic;
  valueType: ValueType;
};

export const buildAnalyticsFromDhisAnalytics = (
  dhisAnalytics: DhisAnalytics,
): RawAnalyticResults => {
  const { headers, rows, metaData: metadata } = dhisAnalytics;
  const columnSpecs = getColumnSpecs(headers);

  const results: Analytic[] = [];
  rows.forEach(row => {
    const result: Partial<Analytic> = {};
    row.forEach((value, columnIndex) => {
      const { dimension, valueType } = columnSpecs[columnIndex];
      if (!dimension) {
        // Fields that are not specified in our dimension translation are excluded from the results
        return;
      }

      result[dimension] = sanitizeValue(value, valueType) as any;
    });

    results.push(result as Analytic);
  });

  return {
    results: results.sort(getSortByKey('period')),
    metadata: translateMetadata(metadata),
  };
};

const getColumnSpecs = (headers: DhisAnalytics['headers']): Partial<ColumnSpec>[] => {
  const columnSpecs = new Array(headers.length).fill({});
  headers.forEach(({ name: dimension, valueType }, columnIndex) => {
    const translatedDimension = DIMENSION_TRANSLATION[dimension as AnalyticDimension];
    if (translatedDimension) {
      columnSpecs[columnIndex] = { dimension: translatedDimension, valueType };
    }
  });

  return columnSpecs;
};

const translateMetadata = (metadata: DhisAnalytics['metaData']) => {
  const { items } = metadata;
  const dataElements = Object.values(items).filter(
    ({ dimensionItemType }) => dimensionItemType === DIMENSION_TYPES.DATA_ELEMENT,
  );

  return { dataElementCodeToName: reduceToDictionary(dataElements, 'code', 'name') };
};
