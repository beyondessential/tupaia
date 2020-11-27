import { sum as mathjsSum, Matrix, filter } from 'mathjs';

export const sum = (numbers?: Matrix): number | undefined => {
  if (numbers === undefined) {
    return undefined;
  }

  return mathjsSum(filter(numbers, number => number !== undefined));
};
