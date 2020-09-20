import { parseParams } from '../../functions';
import { where } from './where';

export const drop = (rows, params) => {
  return rows.map(row => {
    if (!where(row, params)) {
      return { ...row };
    }

    const parsedParams = parseParams(row, params);
    if (typeof parsedParams === 'string') {
      const { [parsedParams]: deletedColumn, ...restOfRow } = row;
      return restOfRow;
    }

    const { [parsedParams.field]: deletedColumn, ...restOfRow } = row;
    return restOfRow;
  });
};
