import { FieldValue, Row } from '../reportBuilder';
import { value, add, eq, neq, exists } from './basic';
import { convertToPeriod, periodToTimestamp, periodToDisplayString } from './utils';
import { parseToken } from './parseToken';

export const functions = {
  value,
  add,
  eq,
  neq,
  exists,
  convertToPeriod,
  periodToTimestamp,
  periodToDisplayString,
};

export { parseToken } from './parseToken';

const mapFunctionToBuiltFunction = (func: (...args: any) => FieldValue) => {
  return (params: unknown) => {
    return (row: Row) => {
      let parsedParams = params;
      if (typeof params === 'string') {
        parsedParams = parseToken(row, params);
      } else if (Array.isArray(params)) {
        parsedParams = params.map((param: unknown) => {
          if (typeof param === 'string') {
            return parseToken(row, param);
          }
          return param;
        });
      } else if (typeof params === 'object' && params !== null) {
        Object.entries(params).forEach(([key, param]) => {
          if (typeof param === 'string') {
            parsedParams[key] = parseToken(row, param);
          }
        });
      }
      return func(parsedParams);
    };
  };
};

export const functionBuilders = {
  value: mapFunctionToBuiltFunction(value),
  add: mapFunctionToBuiltFunction(add),
  eq: mapFunctionToBuiltFunction(eq),
  neq: mapFunctionToBuiltFunction(neq),
  exists: mapFunctionToBuiltFunction(exists),
  convertToPeriod: mapFunctionToBuiltFunction(convertToPeriod),
  periodToTimestamp: mapFunctionToBuiltFunction(periodToTimestamp),
  periodToDisplayString: mapFunctionToBuiltFunction(periodToDisplayString),
};
