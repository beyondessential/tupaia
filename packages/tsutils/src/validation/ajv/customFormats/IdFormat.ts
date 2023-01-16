/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { takesIdForm } from '@tupaia/utils';

export const IdFormat = {
  name: 'id',
  config: {
    validate: (data: string) => {
      try {
        takesIdForm(data);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
};
