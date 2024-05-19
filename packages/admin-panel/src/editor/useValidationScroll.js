/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useEffect } from 'react';

export const useValidationScroll = validationErrors => {
  useEffect(() => {
    if (!validationErrors) return;
    // if there are errors, focus on the first error
    const firstError = document.querySelector('.Mui-error');
    if (!firstError) return;
    firstError.focus();
  }, [validationErrors]);

  return null;
};
