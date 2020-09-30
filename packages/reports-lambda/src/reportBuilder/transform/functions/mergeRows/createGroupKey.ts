import { Row } from '../../../reportBuilder';
import { parseToken } from '../../../functions';

export const buildCreateGroupKey = (params?: string[]) => {
  return (row: Row) => {
    if (params === undefined) {
      return '*';
    }

    return params
      .map(field => {
        const parsedField = parseToken(row, field);
        if (typeof parsedField === 'string') {
          return row[parsedField];
        }
        throw new Error(`Expected all group key fields to be strings but got ${parsedField}`);
      })
      .join('___');
  };
};
