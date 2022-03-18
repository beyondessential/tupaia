/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { yupTsUtils } from '@tupaia/tsutils';

export const starSingleOrMultipleColumnsValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if (typeof value === 'string' || value === undefined) {
      return yup.string();
    }

    if (Array.isArray(value)) {
      return yup.array().of(yup.string().required());
    }

    throw new yup.ValidationError(
      "Input must be either '*', a single column, or an array of columns",
    );
  },
  [yup.string(), yup.array().of(yup.string().required())],
);

export const mapStringToStringValidator = yupTsUtils.describableLazy(
  (value: unknown) => {
    if ((typeof value === 'object' && value !== null) || value === undefined) {
      const stringToStringMapValidator = Object.fromEntries(
        Object.entries(value || {}).map(([field]) => [field, yup.string().required()]),
      );
      return yup.object().shape(stringToStringMapValidator).required();
    }

    throw new yup.ValidationError('Input must be a string to string mapping');
  },
  [yup.object()],
);
