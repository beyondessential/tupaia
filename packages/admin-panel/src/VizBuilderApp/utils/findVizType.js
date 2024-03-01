/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { VIZ_TYPES } from '../constants';

export const findVizType = viz => {
  // Check that all fields in the viz types initial config are match those in the viz
  const vizTypeKeyAndValue = Object.entries(VIZ_TYPES).find(([, { initialConfig }]) =>
    Object.entries(initialConfig).every(([key, value]) => viz.presentation[key] === value),
  );

  return vizTypeKeyAndValue ? vizTypeKeyAndValue[0] : 'OTHER'; // Default to 'OTHER' if viz doesn't match any
};
