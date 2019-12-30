export const generateMs1VariableName = text => {
  let massagedText = text.toLowerCase();
  massagedText = massagedText.replace(/:/g, '');
  massagedText = massagedText.replace(/</g, 'Under');
  massagedText = massagedText.replace(/>/g, 'Over');
  massagedText = massagedText.replace(/=/g, '');
  massagedText = massagedText.replace(/\+/g, 'Plus');
  massagedText = massagedText.replace(/≤/g, 'to');
  massagedText = massagedText.replace(/-/g, 'to');
  massagedText = massagedText.replace(/–/g, '');
  massagedText = massagedText.replace(/\?/g, '');
  massagedText = massagedText.replace('(', '');
  massagedText = massagedText.replace("'", '');
  massagedText = massagedText.replace(')', '');
  massagedText = massagedText.replace('/', '');
  massagedText = massagedText.replace('\\', '');
  massagedText = massagedText.replace(',', '');
  massagedText = massagedText.replace('years', '');
  massagedText = massagedText.replace('old', '');
  massagedText = massagedText.replace('reporting', '');
  massagedText = massagedText.replace('ages', '');
  const words = massagedText.split(' ');
  const variableName = words.reduce((accumulator, currentValue, index) => {
    let resultText = currentValue;
    let accumulatorUpdated = accumulator;
    if (index === 1) {
      accumulatorUpdated = accumulator.toLowerCase();
    }
    resultText = resultText.charAt(0).toUpperCase() + resultText.slice(1).toLowerCase();
    return accumulatorUpdated + resultText;
  });
  return variableName;
};
