import { Schema } from 'ajv';
import betterAjvErrors from 'better-ajv-errors';
import { getAjv } from './getAjv';

export const ajvValidate = <T>(schema: Schema, data: unknown) => {
  const ajv = getAjv();
  const validate = ajv.compile<T>(schema);

  if (validate(data)) {
    return data;
  }

  const betterErrors = betterAjvErrors(schema, data, validate.errors || [], { format: 'js' });
  throw new Error(`Validation Error: ${betterErrors.map(err => err.error)}`);
};
