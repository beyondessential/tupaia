/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewReport, DashboardItemType, DashboardItemReport } from '../../../types';
import { SingleDownloadLink } from './SingleDownloadLink';
import { SingleDate } from './SingleDate';
import { SingleValue } from './SingleValue';
import { MultiValue } from './MultiValue';
import { formatDataValueByType } from '@tupaia/utils';
import { MultiValueRow } from './MultiValueRow';
import { DataDownload } from './DataDownload';

interface ViewProps {
  report: DashboardItemReport;
  config: DashboardItemType;
  isEnlarged?: boolean;
}

const VIEWS = {
  singleValue: SingleValue,
  singleDate: SingleDate,
  singleDownloadLink: SingleDownloadLink,
  multiValue: MultiValue,
  multiValueRow: MultiValueRow,
  dataDownload: DataDownload,
};

const formatData = (data: ViewReport['data'], config: DashboardItemType) => {
  const { valueType, value_metadata: valueMetadata } = config;
  return data?.map(datum => {
    const { value } = datum;
    const metadata = {
      ...(valueMetadata || config[`${datum.name}_metadata` as string] || {}),
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
  const { data } = report as ViewReport;
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
            config={
              {
                ...config,
                viewType: (datum.viewType as DashboardItemType['viewType']) || 'singleValue',
              } as DashboardItemType
            }
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
  return (
    <Component
      report={{
        ...report,
        data: formattedData,
      }}
      config={config}
      isEnlarged={isEnlarged}
    />
  );
};
