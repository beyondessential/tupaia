// /** Higher Order Functions allow us to pass additional args to piped functions */
// export const countValues = valuesOfInterest => {
//   return results => {
//     return results.reduce((data, { value }) => {
//       if (valuesOfInterest && !valuesOfInterest.includes(value)) {
//         return { ...data }; // not interested in this value, ignore it
//       }

//       const existingValue = data[value];
//       if (!existingValue) {
//         const newValue = { value: 0, name: value };
//         return { ...data, [value]: newValue };
//       }

//       existingValue.value += 1;
//       return { ...data, [value]: existingValue };
//     }, {});
//   };
// };

export const countValues = (results, context) => {
  const valuesOfInterest = context.dataBuilderConfig.valuesOfInterest;
  return results.reduce((data, { value }) => {
    if (valuesOfInterest && !valuesOfInterest.includes(value)) {
      return { ...data }; // not interested in this value, ignore it
    }

    const existingValue = data[value];
    if (!existingValue) {
      const newValue = { value: 0, name: value };
      return { ...data, [value]: newValue };
    }

    existingValue.value += 1;
    return { ...data, [value]: existingValue };
  }, {});
};
