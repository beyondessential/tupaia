/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

export const starSingleOrMultipleColumnsValidator = yup.lazy((value: unknown) => {
  if (typeof value === 'string' || value === undefined) {
    return yup.string();
  }

  if (Array.isArray(value)) {
    return yup.array().of(yup.string().required());
  }

  throw new yup.ValidationError(
    "Input must be either '*', a single column, or an array of columns",
  );
});
