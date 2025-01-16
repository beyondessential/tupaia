export const splitStringOn = (string, splitCharacter) => {
  return string ? string.split(splitCharacter).map(segment => segment.trim()) : [];
};

export const splitStringOnComma = string => splitStringOn(string, ',');

export const splitOnNewLinesOrCommas = string => {
  if (!string) return [];
  return string.includes('\n') ? splitStringOn(string, '\n') : splitStringOnComma(string);
};
