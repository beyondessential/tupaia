export const value = (valueGiven: any): any => {
  return valueGiven;
};

export const add = (valuesToAdd: number[]): number => {
  let total = 0;
  valuesToAdd.forEach((valueToAdd: number) => {
    if (valueToAdd) total += valueToAdd;
  });
  return total;
};

export const gt = (valuesToCompare: any[]): boolean => {
  return valuesToCompare[0] > valuesToCompare[1];
};

export const eq = (valuesToCompare: any[]): boolean => {
  return valuesToCompare[0] === valuesToCompare[1];
};

export const neq = (valuesToCompare: any[]): boolean => {
  return valuesToCompare[0] !== valuesToCompare[1];
};
