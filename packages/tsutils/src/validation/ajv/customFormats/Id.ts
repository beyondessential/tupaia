/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { takesIdForm } from '@tupaia/utils';

/**
 * @format Id
 */
export type Id = string;

export const IdFormat = {
  name: 'Id',
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
