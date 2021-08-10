/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useDataTableExport } from '@tupaia/ui-components';
import { getMapTableData } from './getMapTableData';

export const useMapDataExport = viewContent => {
  const { columns, data } = getMapTableData(viewContent);
  useDataTableExport(columns, data, viewContent.name);
};
