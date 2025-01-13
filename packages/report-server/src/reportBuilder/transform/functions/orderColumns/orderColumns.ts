import { isDefined, yupTsUtils } from '@tupaia/tsutils';
import { yup } from '@tupaia/utils';
import { TransformTable } from '../../table';
import { sortByFunctions } from './sortByFunctions';
import { ascOrDescValidator } from '../utils';

type OrderColumnsParams = {
  columnOrder?: string[];
  sorter?: (column1: string, column2: string) => number;
  direction?: 'asc' | 'desc';
};

const sortByValidator = yup
  .mixed<keyof typeof sortByFunctions>()
  .oneOf(Object.keys(sortByFunctions) as (keyof typeof sortByFunctions)[]);

export const paramsValidator = yup.object().shape({
  order: yup.array().of(yup.string().required()),
  sortBy: yupTsUtils.describableLazy(() => sortByValidator, [sortByValidator]),
  direction: yupTsUtils.describableLazy(() => ascOrDescValidator.default('asc'), [
    ascOrDescValidator.default('asc'),
  ]),
});

const orderColumns = (table: TransformTable, params: OrderColumnsParams) => {
  const { columnOrder = ['*'], sorter, direction } = params;

  if (sorter) {
    const newColumns = table.getColumns().sort(sorter);
    if (direction === 'desc') newColumns.reverse();
    return new TransformTable(newColumns, table.getRows());
  }

  if (!columnOrder.includes('*')) {
    columnOrder.push('*'); // Add wildcard to the end if it's not specified
  }

  const existingColumns = table.getColumns();
  const newColumns = new Array<string | undefined>(existingColumns.length).fill(undefined);
  const orderedColumns = existingColumns.filter(column => columnOrder.includes(column));
  const wildcardColumns = existingColumns.filter(column => !columnOrder.includes(column));

  // Filter out columns that are not in the table
  const order = columnOrder.filter(column => existingColumns.includes(column) || column === '*');
  const indexOfWildcard = order.indexOf('*');

  wildcardColumns.forEach((column, index) => {
    newColumns[indexOfWildcard + index] = column;
  });

  orderedColumns.forEach(column => {
    const indexInOrder = order.indexOf(column);
    const indexInNewColumns =
      indexInOrder < indexOfWildcard
        ? indexInOrder // It's before the wildcard, just use the index
        : indexInOrder + orderedColumns.length - 1; // It's after the wildcard, so account for all wildcard columns (minus wildcard itself)
    newColumns[indexInNewColumns] = column;
  });

  const validatedColumns = newColumns.map(column => {
    if (!isDefined(column)) {
      throw new Error('Missing columns when determining new column order');
    }

    return column;
  });

  return new TransformTable(validatedColumns, table.getRows());
};

const buildParams = (params: unknown): OrderColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { order, sortBy, direction } = validatedParams;

  if (order && sortBy) {
    throw new Error('Cannot provide explicit column order and a sort by function');
  }

  if (order) {
    return {
      columnOrder: Array.from(new Set(order)),
    };
  }

  if (sortBy) {
    return {
      direction,
      sorter: sortByFunctions[sortBy],
    };
  }

  throw new Error('Must provide either explicit column order or a sort by function');
};

export const buildOrderColumns = (params: unknown) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => orderColumns(table, builtParams);
};
