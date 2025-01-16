import { splitStringOn, splitStringOnFirstOccurrence } from '../../utilities';

export const caseAndSpaceInsensitiveEquals = (stringA = '', stringB = '') =>
  stringA.toLowerCase().trim() === stringB.toLowerCase().trim();

export const isEmpty = cell => cell === undefined || cell === null || cell.length === 0;

export const isYes = cell => caseAndSpaceInsensitiveEquals(cell, 'yes');

export const isNo = cell => caseAndSpaceInsensitiveEquals(cell, 'no');

export const isYesOrNo = cell => isYes(cell) || isNo(cell);

/**
 * Converts an Excel cell string in the format
 * key: value
 * key: value
 * To a json object in the format
 * {
 *  key: value,
 *  key: value,
 * }
 *
 * @param {string} cellString The string representing the cell in Excel
 * @returns {Object<string, any>}
 */
export const convertCellToJson = (cellString, processValue = value => value) => {
  const jsonObject = {};
  splitStringOn(cellString, '\n')
    .filter(line => line !== '')
    .forEach(line => {
      const [key, value] = splitStringOnFirstOccurrence(line, ':');
      jsonObject[key] = processValue(value);
    });
  return jsonObject;
};
