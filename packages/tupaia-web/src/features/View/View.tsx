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
import { formatDataValueByType } from '@tupaia/utils';
import { MultiValueRow } from './MultiValueRow';
import { DownloadFilesVisual } from '../DownloadFilesVisual';

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
  multiValueRow: MultiValueRow,
  filesDownload: DownloadFilesVisual,
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
      value: formatDataValueByType(
        {
          value,
          metadata,
        },
        valueType,
      ),
    };
  });
};

export const View = ({ report, config, isEnlarged }: ViewProps) => {
  const { viewType } = config;
  const { data } = report;
  if (!data) return null; // in case there is no data at all, return null
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
  return <Component data={formattedData} config={config} isEnlarged={isEnlarged} />;
};
