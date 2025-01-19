export const findVizType = (viz, vizTypes) => {
  // Check that all fields in the viz types initial config match those in the viz
  const vizTypeKeyAndValue = Object.entries(vizTypes).find(
    ([, { vizMatchesType, initialConfig }]) => {
      if (vizMatchesType) {
        return vizMatchesType(viz.presentation);
      }

      // Default to checking if it matches the viz initial config
      return Object.entries(initialConfig).every(([key, value]) => viz.presentation[key] === value);
    },
  );

  return vizTypeKeyAndValue ? vizTypeKeyAndValue[0] : 'OTHER'; // Default to 'OTHER' if viz doesn't match any
};
