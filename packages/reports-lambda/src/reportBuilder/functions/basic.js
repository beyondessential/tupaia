export const value = valueGiven => {
  return valueGiven;
};

export const add = valuesToAdd => {
  let total = 0;
  valuesToAdd.forEach(valueToAdd => {
    if (valueToAdd) total += valueToAdd;
  });
  return total;
};

export const gt = valuesToCompare => {
  return valuesToCompare[0] > valuesToCompare[1];
};

export const eq = valuesToCompare => {
  return valuesToCompare[0] === valuesToCompare[1];
};

export const neq = valuesToCompare => {
  return valuesToCompare[0] !== valuesToCompare[1];
};
