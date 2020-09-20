import { where } from './where';

export const filter = (rows, params) => {
  return rows.filter(row => where(row, params));
};
