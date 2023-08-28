/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { ViewReport, DashboardItemReport, DashboardItemConfig } from '../../../types';
import { SingleDownloadLink } from './SingleDownloadLink';
import { SingleDate } from './SingleDate';
import { SingleValue } from './SingleValue';
import { MultiValue } from './MultiValue';
import { formatDataValueByType } from '@tupaia/utils';
import { MultiValueRow } from './MultiValueRow';
import { DataDownload } from './DataDownload';
import { DownloadFiles } from './DownloadFiles';
import { DashboardInfoHover } from '../../DashboardItem';
interface ViewProps {
  report: DashboardItemReport;
  config: DashboardItemConfig;
  isEnlarged?: boolean;
}

const VIEWS = {
  singleValue: SingleValue,
  singleDate: SingleDate,
  singleDownloadLink: SingleDownloadLink,
  multiValue: MultiValue,
  multiValueRow: MultiValueRow,
  dataDownload: DataDownload,
  filesDownload: DownloadFiles,
};

const formatData = (data: ViewReport['data'], config: ViewConfig) => {
  const { valueType, value_metadata: valueMetadata } = config;
  return data?.map(datum => {
    const { value } = datum;
    const metadata = {
      ...(valueMetadata || config[`${datum.name}_metadata` as any] || {}),
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
  // cast the config to a ViewConfig so we can access the viewType
  const viewConfig = config as ViewConfig;
  const { viewType } = viewConfig;
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
                viewType: (datum.viewType || 'singleValue') as ViewConfig['viewType'],
              } as ViewConfig
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

  const formattedData = formatData(data, viewConfig);
  return (
    <>
      <Component
        report={{
          ...report,
          data: formattedData,
        }}
        config={viewConfig}
        isEnlarged={isEnlarged}
      />
      <DashboardInfoHover infoText={config.description} />
    </>
  );
};
