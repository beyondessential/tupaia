/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { DatabaseModels, getAjv } from './getAjv';
import betterAjvErrors from 'better-ajv-errors';

export const validate = async (schema: any, data: any, models?: DatabaseModels) => {
  const ajv = getAjv(models);
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    // @ts-ignore errors is definitely defined, because !valid
    const betterErrors = betterAjvErrors(schema, data, validate.errors, { format: 'js' });
    throw new Error('Validation Error: ' + betterErrors.map(err => err.error));
  }
  return valid;
};
