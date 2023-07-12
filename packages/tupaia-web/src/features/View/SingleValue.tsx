/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { ViewContent } from '@tupaia/ui-chart-components';

interface SingleValueProps {
  data: ViewContent['data'];
  config?: ViewConfig;
}
export const SingleValue = ({ data, config }: SingleValueProps) => {
  console.log(data);
  return <></>;
};
