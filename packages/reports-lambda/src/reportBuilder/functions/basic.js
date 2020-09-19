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
