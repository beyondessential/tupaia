import { parser, Parser } from 'mathjs';
import { aggregations } from './aggregations';
import { buildWhere } from '../where';
import { Row } from '../../../types';
import { buildCreateGroupKey } from './createGroupKey';
import { buildGetFieldAggregation } from './getFieldAggregation';
import { functions } from '../../../functions';

type AggregateParams = {
  createGroupKey: (row: Row) => string;
  getFieldAggregation: (field: string) => keyof typeof aggregations;
  where: (row: Row, rowParser: Parser) => boolean;
};

const merge = (mergedRow: Row, newRow: Row, params: AggregateParams): Row => {
  Object.keys(newRow).forEach((field: string) => {
    const aggregation = params.getFieldAggregation(field);
    aggregations[aggregation](mergedRow, field, newRow[field]);
  });
  return mergedRow;
};

const aggregate = (rows: Row[], params: AggregateParams): Row[] => {
  const groupedRows: { [groupKey: string]: Row } = {};
  const otherRows: Row[] = [];

  const rowParser = parser();
  Object.entries(functions).forEach(([name, call]) => rowParser.set(name, call));
  const context = {} as { row: Row };
  rowParser.set('$', context);

  rows.forEach((row: Row) => {
    context.row = row;
    if (!params.where(row, rowParser)) {
      otherRows.push(row);
      return;
    }
    const groupKey = params.createGroupKey(row);
    groupedRows[groupKey] = merge(groupedRows[groupKey] || {}, row, params);
  });
  return Object.values(groupedRows).concat(otherRows);
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
