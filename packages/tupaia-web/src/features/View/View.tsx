/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { DashboardItemType } from '../../types';
import { ViewContent } from '@tupaia/ui-chart-components';
import { SingleValue } from './SingleValue';
import { transformDataForViewType } from './utils';

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
  const { data, viewType, ...config } = viewContent;
  const View = VIEWS[viewType as keyof typeof VIEWS];
  if (!View) return null;
  const transformedData = transformDataForViewType(data, viewType);
  return <View data={transformedData} config={config} />;
};
