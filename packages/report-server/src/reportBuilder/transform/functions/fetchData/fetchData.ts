import { yup } from '@tupaia/utils';
import { Context, updateContext } from '../../../context';
import { Row } from '../../../types';
import { createJoin } from './createJoin';
import { TransformTable } from '../../table';
import { TransformParser } from '../../parser';
import { ExitWithNoDataSignal } from '../../transform';

type FetchParams = {
  dataTableCode: string;
  parameters: Record<string, unknown>;
  join: (existingRows: Row[], newRows: Row[]) => Row[];
  exitOnNoData?: boolean;
};

export const paramsValidator = yup.object().shape({
  dataTableCode: yup.string().required(),
  parameters: yup.object().default({}),
  join: yup.array().of(
    yup.object({
      tableColumn: yup.string().required(),
      newDataColumn: yup.string().required(),
    }),
  ),
  exitOnNoData: yup.boolean().default(true),
});

const fetchData = async (table: TransformTable, params: FetchParams, context: Context) => {
  const { dataTableCode, parameters, join, exitOnNoData } = params;
  const parser = new TransformParser(table, context);

  const parsedParameters = Object.fromEntries(
    Object.entries(parameters).map(([field, value]) => {
      if (typeof value === 'string') {
        return [field, parser.evaluate(value)];
      }
      return [field, value];
    }),
  );

  const fetchParameters = { ...context.request.query, ...parsedParameters };
  const response = await context.request.services.dataTable.fetchData(
    dataTableCode,
    fetchParameters,
  );

  const newRows = response.data as Row[];

  if (newRows.length === 0 && exitOnNoData) {
    throw new ExitWithNoDataSignal();
  }

  const existingColumns = table.getColumns();
  const newColumns = Array.from(new Set(newRows.flatMap(Object.keys))).filter(
    column => !existingColumns.includes(column),
  );

  const jointRows = join(table.getRows(), newRows);
  await updateContext(context, jointRows); // TODO: Remove this in favour of using data-tables (RN-687)

  return new TransformTable([...existingColumns, ...newColumns], jointRows);
};

const buildParams = (params: unknown): FetchParams => {
  const { dataTableCode, parameters, join, exitOnNoData } = paramsValidator.validateSync(params);

  const joinFunction = createJoin(join);
  return {
    dataTableCode,
    parameters,
    join: joinFunction,
    exitOnNoData,
  };
};

export const buildFetchData = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => fetchData(table, builtParams, context);
};
