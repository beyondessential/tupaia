/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataFetchingTable } from '@tupaia/ui-components';
import { connectApi } from '../../api';

function mapApiToDataFetchingTable(api, { endpoint, fetchOptions }) {
  return {
    fetchData: queryParameters => api.get(endpoint, { ...fetchOptions, ...queryParameters }),
  };
}

export const ConnectedTable = connectApi(mapApiToDataFetchingTable)(DataFetchingTable);
