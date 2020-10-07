import { Row } from '../reportBuilder';
import { value, add, eq, neq, exists } from './basic';
import { convertToPeriod, periodToTimestamp, periodToDisplayString } from './utils';
import { parseToken } from './parseToken';

const createFunctionBuilder = <F extends (...args: any) => any>(func: F) => {
  return (params: unknown) => {
    return (row: Row): ReturnType<F> => {
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
        const newParsedParams = { ...params } as { [key: string]: any };
        Object.entries(params).forEach(([key, param]) => {
          if (typeof param === 'string') {
            newParsedParams[key] = parseToken(row, param);
          }
        });
        parsedParams = newParsedParams;
      }
      return func(parsedParams);
    };
  };
};

export const functionBuilders = {
  value: createFunctionBuilder(value),
  add: createFunctionBuilder(add),
  eq: createFunctionBuilder(eq),
  neq: createFunctionBuilder(neq),
  exists: createFunctionBuilder(exists),
  convertToPeriod: createFunctionBuilder(convertToPeriod),
  periodToTimestamp: createFunctionBuilder(periodToTimestamp),
  periodToDisplayString: createFunctionBuilder(periodToDisplayString),
};

export { parseToken } from './parseToken';
