import React, { useContext } from 'react';
import styled from 'styled-components';

import { type ViewConfig, type ViewReport, isViewReport } from '@tupaia/types';
import { formatDataValueByType } from '@tupaia/utils';
import { DashboardInfoHover, DashboardItemContext } from '../../DashboardItem';
import { DataDownload, DownloadFiles } from './Download';
import { MultiPhotograph } from './MultiPhotograph';
import { MultiValue } from './MultiValue';
import { MultiValueRow } from './MultiValueRow';
import { QRCode } from './QRCode';
import { SingleDate } from './SingleDate';
import { SingleDownloadLink } from './SingleDownloadLink';
import { SingleValue } from './SingleValue';

const MultiSingleValueWrapper = styled.div`
  & + & {
    margin-top: 1rem;
    text-align: center;
  }

  .MuiTypography-root {
    font-size: 1.25rem;
  }
`;
interface ViewProps {
  /** This is to allow for multi value view types, which mean this component is treated as a recursive component */
  customReport?: ViewReport;
  customConfig?: ViewConfig;
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
  multiPhotograph: MultiPhotograph,
} as const;

const formatData = (data: ViewReport['data'], config: ViewConfig) => {
  const { valueType } = config;
  return data?.map(datum => {
    const { value, value_metadata: valueMetadata } = datum;
    const metadata = {
      ...(valueMetadata || config[`${datum.name}_metadata` as any] || config || {}),
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
  const {
    config: originalConfig,
    report: originalReport,
    isEnlarged,
    isExport,
    reportCode,
  } = useContext(DashboardItemContext);
  const report = customReport || originalReport;
  const config = customConfig || originalConfig;
  // cast the config to a ViewConfig so we can access the viewType
  const viewConfig = config as ViewConfig;
  const { viewType } = viewConfig;

  // add a type guard to ensure that the report is a ViewReport, even though we know it will be
  if (!isViewReport(report) || !report?.data) return null; // in case there is no data at all, return null
  const { data } = report;
  if (viewType === 'multiSingleValue') {
    // for multi single values, we need to render each data point as a separate single value item
    return (
      <>
        {data?.map((datum, i) => (
          <MultiSingleValueWrapper key={i}>
            <View
              customReport={
                {
                  ...report,
                  data: [datum],
                } as ViewReport
              }
              customConfig={
                {
                  ...config,
                  viewType: datum.viewType || 'singleValue',
                } as ViewConfig
              }
            />
          </MultiSingleValueWrapper>
        ))}
      </>
    );
  }

  const Component = VIEWS[viewType];

  // if the view type is not supported, return null
  if (!Component) return null;

  const formattedData = formatData(data, viewConfig);

  // Only show the hover effect if the view is not enlarged and there is no period granularity, because this means that the view is not expandable
  const showHoverEffect = !isEnlarged && !config?.periodGranularity;
  return (
    <>
      <Component
        // Ensure stale rows don’t persist when navigating date ranges
        key={`${reportCode}\u{200D}${report.startDate}:${report.endDate}`}
        report={
          {
            ...report,
            data: formattedData,
          } as ViewReport
        }
        config={viewConfig}
        isEnlarged={isEnlarged}
        isExport={isExport}
        isMultiSingleValue={!!customReport} // if this is a multi single value, we need to pass this prop down to the SingleValue component
      />
      {showHoverEffect && <DashboardInfoHover infoText={viewConfig.description} />}
    </>
  );
};
