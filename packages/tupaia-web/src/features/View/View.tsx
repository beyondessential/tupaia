/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { VIEWS } from './utils';
import { ViewReport } from '../../types';

interface ViewProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
}

export const View = ({ report, config, isEnlarged }: ViewProps) => {
  const { viewType } = config;
  if (viewType === 'multiSingleValue') {
    const { data } = report;
    return (
      <>
        {data?.map((datum, i) => (
          <View
            report={{
              ...report,
              data: [datum],
            }}
            config={{
              ...config,
              viewType: datum.viewType || 'singleValue',
            }}
            isEnlarged={isEnlarged}
            key={i}
          />
        ))}
      </>
    );
  }
  const Component = VIEWS[viewType as keyof typeof VIEWS];
  if (!Component) return null;

  return <Component report={report} config={config} />;
};
