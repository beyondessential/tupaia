/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { DashboardItemType } from '../../types';
import { ViewContent } from '@tupaia/ui-chart-components';
import { SingleValue } from './SingleValue';

interface ViewProps {
  viewContent: Omit<DashboardItemType, 'viewType'> &
    ViewConfig & {
      viewType: 'view';
      data: ViewContent['data'];
    };
  isEnlarged?: boolean;
}

const VIEWS = {
  singleValue: SingleValue,
};
export const View = ({ viewContent, isEnlarged }: ViewProps) => {
  const { data, viewType, ...rest } = viewContent;
  const View = VIEWS[viewType as keyof typeof VIEWS];
  console.log(viewType);
  if (!View) return null;
  return <View data={data} config={rest} />;
};
