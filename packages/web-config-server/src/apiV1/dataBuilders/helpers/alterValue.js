const ALTER_TYPE_TO_METHOD = {
  '/': (value, parameter) => value / parameter,
};

export const alterValue = (operator, value, parameter) => {
  if (!value || !parameter || !operator) {
    return value;
  }

  const alterMethod = ALTER_TYPE_TO_METHOD[operator];

  return alterMethod ? alterMethod(value, parameter) : value;
};
