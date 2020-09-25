import { limitRange } from './limitRange';

export const calculatePercentagesWithinRange = (countsByGroup, range) =>
  Object.values(countsByGroup).map(({ name, total, ...counts }) => {
    const percentages = {};

    Object.entries(counts).forEach(([valueKey, count]) => {
      percentages[valueKey] = range ? limitRange(count / total, range) : count / total;
    });
    return {
      name,
      ...percentages,
    };
  });
