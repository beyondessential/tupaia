/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
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
import { QRCode } from './QRCode';
import { DashboardItemContext } from '../../DashboardItem';

interface ViewProps {
  /** This is to allow for multi value view types, which mean this component is treated as a recursive component */
  customReport: DashboardItemReport;
  customConfig: DashboardItemConfig;
}

const VIEWS = {
  singleValue: SingleValue,
  singleDate: SingleDate,
  singleDownloadLink: SingleDownloadLink,
  multiValue: MultiValue,
  multiValueRow: MultiValueRow,
  dataDownload: DataDownload,
  filesDownload: DownloadFiles,
  qrCodeVisual: QRCode,
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

export const View = ({ customConfig, customReport }: ViewProps) => {
  const { config: originalConfig, report: originalReport, isEnlarged } = useContext(
    DashboardItemContext,
  );
  const report = customReport || originalReport;
  const config = customConfig || originalConfig;
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
            customReport={{
              ...report,
              data: [datum],
            }}
            customConfig={
              {
                ...config,
                viewType: (datum.viewType || 'singleValue') as ViewConfig['viewType'],
              } as ViewConfig
            }
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
    <Component
      report={{
        ...report,
        data: formattedData,
      }}
      config={viewConfig}
      isEnlarged={isEnlarged}
    />
  );
};
