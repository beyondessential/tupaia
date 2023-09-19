/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { Option } from '@tupaia/types';
import { get } from '../api';

export const useAutocompleteOptions = (optionSetId?: string | null) => {
  return useQuery(
    ['autocompleteOptions', optionSetId],
    (): Promise<Option[]> =>
      get(`optionSets/${optionSetId}/options`, {
        enabled: !!optionSetId,
      }),
  );
};
