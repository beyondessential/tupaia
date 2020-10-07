import { Row, FieldValue } from '../reportBuilder';

export const parseToken = (row: Row, token: string): FieldValue => {
  if (!token.match(/^<.*>$/i)) {
    return token;
  }

  const strippedToken: string = token.substring(1, token.length - 1); //Remove '<', '>' tags
  const valueFromRow = row[strippedToken];
  return valueFromRow;
};
