/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ViewConfig } from '@tupaia/types';

const SINGLE_VALUE_COMPONENTS = [
  'singleTick',
  'singleValue',
  'singleDate',
  'singleDownloadLink',
  'singleComparison',
];

export const transformDataForViewType = (data: any, viewType: ViewConfig['viewType']) => {
  if (
    SINGLE_VALUE_COMPONENTS.includes(viewType) &&
    Array.isArray(data) &&
    typeof data[0] === 'object'
  ) {
    return data[0];
  }

  return data;
};
