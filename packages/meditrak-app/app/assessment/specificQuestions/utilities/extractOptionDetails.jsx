/**
 * Options can either be defined as simple strings, which will be used as both their label and
 * value, or as a string of JSON that separately defines the label and value, and optionally the
 * color it is presented in
 */
export const extractOptionDetails = optionString => {
  let optionObject;
  try {
    // If it can be parsed into a JSON object, do so and extract the pre-configured label,
    // value, and optional color
    optionObject = JSON.parse(optionString);
    if (!optionObject.value) {
      // Valid JSON but not a valid option object, e.g. '50'
      throw new Error('Options defined as an object must contain the value key at minimum');
    }
  } catch {
    // This is not a valid JSON object, just use the string itself as the value and label
    optionObject = { value: optionString, label: optionString };
  }
  return optionObject;
};
