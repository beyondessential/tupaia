import { Row } from '../../../types';
import { aggregations } from './aggregations';

export const buildCreateGroupKey = (params: { [key: string]: keyof typeof aggregations }) => {
  return (row: Row) => {
    if (!Object.values(params).some(aggregation => aggregation === 'group')) {
      return '*';
    }

    return Object.entries(params)
      .filter(([field, aggregation]) => aggregation === 'group')
      .map(([field, aggregation]) => row[field])
      .join('___');
  };
};
