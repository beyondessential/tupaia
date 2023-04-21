/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';

import { TupaiaApi } from '../api';
import { convertSearchTermToFilter, makeSubstitutionsInString } from '../utilities';
import { MAX_AUTOCOMPLETE_RESULTS } from './constants';

const api = new TupaiaApi();

export const useSearchResults = ({
  endpoint,
  searchTerm,
  labelColumn,
  valueColumn,
  pageSize = MAX_AUTOCOMPLETE_RESULTS,
  parentRecord = {},
  baseFilter = {},
}) =>
  useQuery(
    ['useSearchResults', endpoint, searchTerm, labelColumn, valueColumn, pageSize, parentRecord],
    async () => {
      const filter = convertSearchTermToFilter({ ...baseFilter, [labelColumn]: searchTerm });

      const result = await api.get(makeSubstitutionsInString(endpoint, parentRecord), {
        filter: JSON.stringify(filter),
        pageSize,
        sort: JSON.stringify([`${labelColumn} ASC`]),
        columns: JSON.stringify([labelColumn, valueColumn]),
        distinct: true,
      });
      return result.body;
    },
  );
