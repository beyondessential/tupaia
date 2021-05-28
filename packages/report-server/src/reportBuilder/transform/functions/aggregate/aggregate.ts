/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TransformParser } from '../../parser';
import { aggregations } from './aggregations';
import { buildWhere } from '../where';
import { Row, FieldValue } from '../../../types';
import { buildCreateGroupKey } from './createGroupKey';
import { buildGetFieldAggregation } from './getFieldAggregation';
import { functions } from '../../../functions';

type AggregateParams = {
  createGroupKey: (row: Row) => string;
  getFieldAggregation: (field: string) => keyof typeof aggregations;
  where: (parser: TransformParser) => boolean;
};

type RowFields = {
  [fieldKey: string]: FieldValue[];
};

type GroupRowFields = {
  [groupKey: string]: RowFields;
};

type AggregatedRowFields = {
  [groupKey: string]: Row;
};

const getGroupRowFields = (
  rows: Row[],
  params: AggregateParams,
): { groupRowFields: GroupRowFields; otherRows: Row[] } => {
  const groupRowFields: GroupRowFields = {};
  const parser = new TransformParser(rows, functions);
  const otherRows: Row[] = [];

  rows.forEach((row: Row) => {
    if (!params.where(parser)) {
      otherRows.push(row);
      parser.next();
      return;
    }
    const groupKey = params.createGroupKey(row);
    groupRowFields[groupKey] = merge(groupRowFields[groupKey] || {}, row);
    parser.next();
  });

  return { groupRowFields, otherRows };
};

const merge = (previousRow: RowFields, newRow: Row): RowFields => {
  const mergedRow = { ...previousRow };
  Object.keys(newRow).forEach((field: string) => {
    mergedRow[field] = [...(mergedRow[field] || []), newRow[field]];
  });
  return mergedRow;
};

const getAggregatedRows = (groupRowFields: GroupRowFields, params: AggregateParams): Row[] => {
  const aggregatedRowFields: AggregatedRowFields = {};
  Object.entries(groupRowFields).forEach(([groupKey, fieldValues]) => {
    Object.entries(fieldValues).forEach(([fieldKey, fieldValue]) => {
      const aggregation = params.getFieldAggregation(fieldKey);
      const aggregatedValue = aggregations[aggregation](fieldValue);
      if (aggregatedValue !== undefined) {
        aggregatedRowFields[groupKey] = {
          ...aggregatedRowFields[groupKey],
          [fieldKey]: aggregatedValue,
        };
      }
    });
  });
  return Object.values(aggregatedRowFields);
};

const aggregate = (rows: Row[], params: AggregateParams): Row[] => {
  const { groupRowFields, otherRows } = getGroupRowFields(rows, params);
  const aggregatedRows = getAggregatedRows(groupRowFields, params);
  return aggregatedRows.concat(otherRows);
};

const buildParams = (params: unknown): AggregateParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { where, ...restOfAggregations } = params;

  Object.values(restOfAggregations).forEach(aggregation => {
    if (typeof aggregation !== 'string' || !(aggregation in aggregations)) {
      throw new Error(
        `Expected all aggregations to be one of ${Object.keys(
          aggregations,
        )} but got ${aggregation}`,
      );
    }
  });

  return {
    createGroupKey: buildCreateGroupKey(
      restOfAggregations as { [key: string]: keyof typeof aggregations },
    ),
    getFieldAggregation: buildGetFieldAggregation(
      restOfAggregations as { [key: string]: keyof typeof aggregations },
    ),
    where: buildWhere(params),
  };
};

export const buildAggregate = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => aggregate(rows, builtParams);
};
