/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { yupTsUtils } from '@tupaia/tsutils';
import { FetchReportQuery } from '../../../../types';
import { ReportServerAggregator } from '../../../../aggregator';
import { FetchConfig, FetchResponse } from './types';
import { fetchBuilders } from './functions';
import { Context, updateContext, updateOutputContext } from '../../../context';
import { Row } from '../../../types';
import { QueryBuilder } from './query';
import { createJoin } from './createJoin';
import { TransformTable } from '../../table';

type FetchParams = {
  config: FetchConfig;
  fetch: (aggregator: ReportServerAggregator, query: FetchReportQuery) => Promise<FetchResponse>;
  join: (existingRows: Row[], newRows: Row[]) => Row[];
};

const periodTypeValidator = yup.mixed().oneOf(['day', 'week', 'month', 'quarter', 'year']);

const createDataSourceValidator = (sourceType: 'dataElement' | 'dataGroup') => {
  const otherSourceKey = sourceType === 'dataElement' ? 'dataGroups' : 'dataElements';

  return yup
    .array()
    .of(yup.string().required())
    .when(['$testData', otherSourceKey], {
      is: ($testData: unknown, otherDataSource: string[]) =>
        !$testData && (!otherDataSource || otherDataSource.length === 0),
      then: yup
        .array()
        .of(yup.string().required())
        .required('Requires "dataGroups" or "dataElements"')
        .min(1),
    });
};

const dataElementValidator = createDataSourceValidator('dataElement');
const dataGroupValidator = createDataSourceValidator('dataGroup');

const aggregationStringValidator = yup.string().min(1);
const aggregationObjectValidator = yup.object().shape({
  type: yup.string().min(1).required(),
  config: yup.object(),
});

const aggregationValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (typeof value === 'string') {
      return aggregationStringValidator;
    }

    return aggregationObjectValidator;
  },
  [aggregationStringValidator, aggregationObjectValidator],
);

const dateStringValidator = yup.string().min(4);
const dateObjectValidator = yup
  .object({
    unit: periodTypeValidator.required(),
    offset: yup.number(),
    modifier: yup.mixed().oneOf(['start_of', 'end_of']),
    modifierUnit: periodTypeValidator,
  })
  .notRequired()
  .default(undefined);
const dateSpecsValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (typeof value === 'string') {
      return dateStringValidator;
    }

    return dateObjectValidator;
  },
  [dateStringValidator, dateObjectValidator],
);

const organisationUnitsStringValidator = yup.string();
const organisationUnitsArrayValidator = yup.array().of(yup.string().required()).required();
const organisationUnitsValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (value === undefined || typeof value === 'string') {
      return organisationUnitsStringValidator;
    }

    return organisationUnitsArrayValidator;
  },
  [organisationUnitsStringValidator, organisationUnitsArrayValidator],
);

export const paramsValidator = yup.object().shape({
  parameters: yup.object().shape(
    {
      dataElements: dataElementValidator,
      dataGroups: dataGroupValidator,
      aggregations: yup.array().of(aggregationValidator as any), // https://github.com/jquense/yup/issues/1283#issuecomment-786559444
      organisationUnits: organisationUnitsValidator,
      startDate: dateSpecsValidator,
      endDate: dateSpecsValidator,
    },
    [['dataElements', 'dataGroups']],
  ),
  join: yup
    .object({
      tableColumn: yup.string().required(),
      newDataColumn: yup.string().required(),
    })
    .notRequired()
    .default(undefined),
});

const fetchData = async (table: TransformTable, params: FetchParams, context: Context) => {
  const { config, fetch, join } = params;
  const builtQuery = await new QueryBuilder(table, context, config).build();
  const response = await fetch(context.request.aggregator, builtQuery);
  await updateContext(context, response); // TODO: Remove this in favour of using data-tables (RN-687)
  await updateOutputContext(context, config.dataGroups); // TODO: Remove this in favour of using data-tables (RN-688)
  const newRows = response.results;
  const existingColumns = table.getColumns();
  const newColumns = Array.from(new Set(newRows.map(Object.keys).flat())).filter(
    column => !existingColumns.includes(column),
  );
  const jointRows = join(table.getRows(), newRows);
  return new TransformTable([...existingColumns, ...newColumns], jointRows);
};

const buildParams = (params: unknown): FetchParams => {
  const { parameters, join } = paramsValidator.validateSync(params);

  const fetchFunction = 'dataGroups' in parameters ? 'dataGroups' : 'dataElements';
  const joinFunction = createJoin(join);
  return {
    config: parameters,
    fetch: fetchBuilders[fetchFunction](parameters),
    join: joinFunction,
  };
};

export const buildFetchData = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => fetchData(table, builtParams, context);
};
