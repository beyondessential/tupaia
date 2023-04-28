/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { makeSubstitutionsInString } from '../utilities';
import { TupaiaApi } from '../api';

const api = new TupaiaApi();

export const useGetInitialOptions = ({
  endpoint,
  values = [],
  labelColumn,
  valueColumn,
  parentRecord = {},
  baseFilter = {},
}) =>
  useQuery(
    ['useGetInitialOptions', endpoint, values, labelColumn, valueColumn, parentRecord, baseFilter],
    async () => {
      if (values.length === 0) {
        return [];
      }

      const filter = { ...baseFilter, [valueColumn]: values };

      const result = await api.get(makeSubstitutionsInString(endpoint, parentRecord), {
        filter: JSON.stringify(filter),
        pageSize: 10000,
        columns: JSON.stringify([labelColumn, valueColumn]),
      });

      return result.body;
    },
  );
