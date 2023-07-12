/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { ViewReport } from '../../types';
import { SingleDownloadLink } from './SingleDownloadLink';
import { SingleDate } from './SingleDate';
import { SingleValue } from './SingleValue';

interface ViewProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
}

export const VIEWS = {
  singleValue: SingleValue,
  singleDate: SingleDate,
  singleDownloadLink: SingleDownloadLink,
};

export const View = ({ report, config, isEnlarged }: ViewProps) => {
  const { viewType } = config;
  const { data } = report;
  if (viewType === 'multiSingleValue') {
    // for multi single values, we need to render each data point as a separate single value item
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

  return <Component data={data} config={config} />;
};
