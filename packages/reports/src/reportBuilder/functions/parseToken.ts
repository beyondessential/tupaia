import { Row, FieldValue } from '../types';
import { Parser } from 'mathjs';

export const parseToken = (row: Row, token: string): FieldValue => {
  if (!token.match(/^<.*>$/i)) {
    return token;
  }

  const strippedToken: string = token.substring(1, token.length - 1); //Remove '<', '>' tags
  const valueFromRow = row[strippedToken];
  return valueFromRow;
};

export const parseExpression = (parser: Parser, expression: string): FieldValue => {
  try {
    return parser.evaluate(expression);
  } catch (error) {
    console.log(error.message);
    return undefined;
  }
};
