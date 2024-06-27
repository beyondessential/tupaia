/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { Schema } from 'ajv';
import { getAjv } from './getAjv';
import { formatAjvErrors } from './formatAjvErrors';

export const ajvValidate = <T>(schema: Schema, data: unknown) => {
  const ajv = getAjv();
  const validate = ajv.compile<T>(schema);

  if (validate(data)) {
    return data;
  }

  const errors = validate.errors || [];
  throw new Error(formatAjvErrors(errors));
};
