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
import { MultiValue } from './MultiValue';
import { BooleanDisplay } from './BooleanDisplay';
import { formatDataValueByType } from '@tupaia/utils';

interface ViewProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
}

const VIEWS = {
  singleValue: SingleValue,
  singleDate: SingleDate,
  singleDownloadLink: SingleDownloadLink,
  multiValue: MultiValue,
};

const formatData = (data: ViewReport['data'], config: ViewConfig) => {
  const { valueType, value_metadata: valueMetadata } = config;
  return data?.map(datum => {
    const { value } = datum;
    const metadata = {
      ...(valueMetadata || config[`${datum.name}_metadata`] || {}),
      ...datum,
    };
    return {
      ...datum,
      value:
        valueType === 'boolean' ? (
          <BooleanDisplay value={value as number} metadata={metadata} />
        ) : (
          formatDataValueByType(
            {
              value,
              metadata,
            },
            valueType,
          )
        ),
    };
  });
};

export const View = ({ report, config, isEnlarged }: ViewProps) => {
  const { viewType } = config;
  const { data } = report;
  if (!data) return null;
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

  // if the view type is not supported, return null
  if (!Component) return null;

  const formattedData = formatData(data, config);
  return <Component data={formattedData} config={config} />;
};
