import { functions, parseParams } from '../../functions';

export const where = (row, params) => {
  const { where: whereClaus } = parseParams(row, params);
  if (!whereClaus) {
    return true;
  }

  const whereFunctionName = Object.keys(whereClaus)[0];
  return functions[whereFunctionName](whereClaus[whereFunctionName]);
};
