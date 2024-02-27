/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ajvValidate } from '@tupaia/tsutils';
import { VIZ_TYPES } from '../constants';

export const findVizType = viz => {
  const vizTypeKeyAndValue = Object.entries(VIZ_TYPES).find(([, { schema }]) => {
    try {
      ajvValidate(schema, viz.presentation);
      return true; // viz matches schema
    } catch {
      // Doesn't match
      return false;
    }
  });

  return vizTypeKeyAndValue ? vizTypeKeyAndValue[0] : null;
};
