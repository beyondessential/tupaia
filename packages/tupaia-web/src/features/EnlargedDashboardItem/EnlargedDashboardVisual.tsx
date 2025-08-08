import React, { useContext } from 'react';
import moment, { Moment } from 'moment';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { FlexColumn, ReferenceTooltip } from '@tupaia/ui-components';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useDateRanges } from '../../utils';
import { DateRangePicker } from '../../components';
import { Entity } from '../../types';
import { useExportSettings } from '../ExportSettings';
import { DashboardItemContent, DashboardItemContext } from '../DashboardItem';
import { BackLink } from './BackLink';
import { ExportDashboardItemContext, useEnlargedDashboardItem } from './utils';

const Container = styled(FlexColumn)<{
  $isExportMode?: boolean;
}>`
  width: 100%;
  height: 100%;
  flex: 1;
  .recharts-responsive-container {
    min-height: 22.5rem;
  }
  .recharts-cartesian-axis-tick {
    font-size: ${({ $isExportMode }) => ($isExportMode ? '0.875rem' : '1rem')};
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  text-align: center;
  margin: 0;
  line-height: 1.4;
  padding: 1.5rem 1.5rem 0; // to account for buttons on modal at smaller screens overlapping title text
`;

const TitleWrapper = styled(FlexColumn)`
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
`;

const Subheading = styled(Typography).attrs({
  variant: 'h3',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ExportDate = styled(Typography)`
  color: #333333;
  font-size: 0.75rem;
  padding-block: 1rem 0.3rem;
`;

interface EnlargedDashboardVisualProps {
  entityName?: Entity['name'];
  isPreview?: boolean;
}

/*
 * EnlargedDashboardVisual is the enlarged dashboard item report visuals. It handles the case of a preview as well as the regular enlarged dashboard item.
 */
export const EnlargedDashboardVisual = ({
  entityName,
  isPreview,
}: EnlargedDashboardVisualProps) => {
  const { exportWithLabels, exportWithTable } = useExportSettings();
  const { isExportMode } = useContext(ExportDashboardItemContext);
  const {
    currentDashboardItem,
    parentDashboardItem,
    reportData,
    reportError,
    refetchReportData,
    isLoadingReportData,
  } = useEnlargedDashboardItem();

  const {
    startDate,
    endDate,
    setDates,
    showDatePicker,
    minStartDate,
    maxEndDate,
    periodGranularity,
    weekDisplayFormat,
    onResetDate,
  } = useDateRanges(URL_SEARCH_PARAMS.REPORT_PERIOD, currentDashboardItem?.config);

  const { config } = currentDashboardItem || {};

  // @ts-ignore - entityHeader is in all lowercase in the types config
  const titleText = `${config?.name}, ${config?.entityHeader || entityName}`;

  // Don't render the visual if we're in export mode and this is not a preview
  if (isExportMode && !isPreview) return null;
  // format the dates for export
  const formatDate = (date: Moment | string) => moment(date).format('DD/MM/YY');

  // today's date for export
  const date = String(moment());

  const getMergedConfig = () => {
    // gauge charts don't have presentation options
    if (config?.type !== 'chart' || config?.chartType === 'gauge') return config;
    // only apply these changes to chart types, as they are not relevant to other types
    if ('presentationOptions' in currentDashboardItem?.config) {
      return {
        ...config,
        presentationOptions: {
          ...config?.presentationOptions,
          exportWithLabels,
          exportWithTable,
        },
      };
    }
    return {
      ...config,
      presentationOptions: {
        exportWithLabels,
        exportWithTable,
      },
    };
  };

  const mergedConfig = getMergedConfig();

  return (
    <Container $isExportMode={isExportMode}>
      <TitleWrapper>
        <BackLink parentDashboardItem={parentDashboardItem} />
        {config?.name && (
          <Title>
            {titleText}
            {config?.reference && <ReferenceTooltip reference={config.reference} />}
          </Title>
        )}

        {showDatePicker && !isExportMode && (
          <DateRangePicker
            granularity={periodGranularity}
            onSetDates={setDates}
            startDate={startDate}
            endDate={endDate}
            minDate={minStartDate}
            maxDate={maxEndDate}
            weekDisplayFormat={weekDisplayFormat}
            onResetDate={onResetDate}
            dateOffset={config?.dateOffset}
            dateRangeDelimiter={config?.dateRangeDelimiter}
          />
        )}
      </TitleWrapper>
      {config?.description && <Subheading>{config?.description}</Subheading>}
      <ContentWrapper>
        <DashboardItemContext.Provider
          value={{
            report: reportData,
            isLoading: isLoadingReportData,
            error: reportError,
            refetch: refetchReportData,
            isEnlarged: true,
            isExport: isPreview,
            reportCode: currentDashboardItem?.reportCode,
            config: mergedConfig,
            isEnabled: true,
          }}
        >
          <DashboardItemContent />
        </DashboardItemContext.Provider>
        {isPreview && (
          <ExportDate>
            {startDate &&
              endDate &&
              `Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}. `}
            Exported on {date} from tupaia.org
          </ExportDate>
        )}
      </ContentWrapper>
    </Container>
  );
};
