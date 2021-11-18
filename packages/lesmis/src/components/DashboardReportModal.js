/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { utcMoment } from '@tupaia/utils';
import { useTheme } from '@material-ui/core/styles';
import {
  Box,
  useMediaQuery,
  Slide,
  Typography,
  Dialog as MuiDialog,
  Container as MuiContainer,
  CircularProgress,
} from '@material-ui/core';
import { DateRangePicker, WhiteButton, SplitButton } from '@tupaia/ui-components';
import { useChartDataExport } from '@tupaia/ui-components/lib/chart';
import * as COLORS from '../constants';
import { FlexColumn, FlexSpaceBetween, FlexStart } from './Layout';
import { DialogHeader } from './FullScreenDialog';
import { useDashboardReportDataWithConfig, useEntityData } from '../api/queries';
import { useI18n, useUrlParams, useUrlSearchParams, useExportToPNG } from '../utils';
import { DashboardReport } from './DashboardReport';

// Transition component for modal animation
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  background: ${props => (props.$isExporting ? 'none' : COLORS.GREY_F9)};
  min-height: 720px;
`;

const Container = styled(MuiContainer)`
  padding: 0 6.25rem 3rem;
  padding-bottom: 5vh;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled(FlexSpaceBetween)`
  padding-top: 2.2rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  margin-bottom: 1.6rem;
  z-index: 1;

  .MuiTextField-root {
    margin-right: 0;
  }
`;

const Toolbar = styled(FlexStart)`
  display: ${props => (props.$isExporting ? 'none' : 'flex')};
`;

const Heading = styled(Typography)`
  font-size: 1.25rem;
  line-height: 1.4rem;
  font-weight: 500;
`;

const Description = styled(Typography)`
  font-size: 1rem;
  line-height: 1.4rem;
  color: ${props => props.theme.palette.text.secondary};
  margin-top: 0.625rem;
`;

const ExportLoader = styled(FlexColumn)`
  display: ${props => (props.$isExporting ? 'flex' : 'none')};
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1;
`;

const ExportText = styled(Description)`
  text-align: center;
`;

const formatDate = date => utcMoment(date).format('DD/MM/YY');

// eslint-disable-next-line react/prop-types
const ExportDate = ({ startDate, endDate }) => {
  const date = String(utcMoment());
  return (
    <ExportText>
      {startDate &&
        endDate &&
        `Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}. `}
      Exported on {date} from {window.location.hostname}
    </ExportText>
  );
};

const useExportFormats = () => {
  const { translate } = useI18n();

  return [
    { id: 'xlsx', label: translate('dashboards.exportToXlsx') },
    { id: 'png', label: translate('dashboards.exportToPng') },
    { id: 'pngWithLabels', label: translate('dashboards.exportToPngWithLabels') },
    { id: 'pngWithTable', label: translate('dashboards.exportToPngWithTable') },
  ];
};

export const DashboardReportModal = () => {
  const theme = useTheme();
  const exportFormats = useExportFormats();
  const [exportFormatId, setExportFormatId] = useState(exportFormats[1].id);
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { entityCode } = useUrlParams();
  const [{ startDate, endDate, reportCode }, setParams] = useUrlSearchParams();
  const { data: entityData, isLoadingEntityData } = useEntityData(entityCode);
  const { data, isLoading } = useDashboardReportDataWithConfig({
    entityCode,
    reportCode,
    startDate,
    endDate,
  });

  const { dashboardItemConfig: config, reportData } = data;

  // Set default export options from config if they are set
  useEffect(() => {
    const exportWithLabels = config?.presentationOptions?.exportWithLabels;
    const exportWithTable = config?.presentationOptions?.exportWithTable;

    if (exportWithTable) {
      setExportFormatId('pngWithTable');
    } else if (exportWithLabels) {
      setExportFormatId('pngWithLabels');
    }
  }, [JSON.stringify(config), setExportFormatId]);

  // Set up PNG export
  const pngExportFilename = `export-${config?.name}-${new Date().toDateString()}`;
  const { isExporting, isExportLoading, exportRef, exportToPNG } = useExportToPNG(
    pngExportFilename,
  );

  // Set up Excel export
  const viewContent = { ...config, data: reportData, startDate, endDate };
  const excelExportTitle = `${viewContent?.name}, ${entityData?.name}`;
  const { doExport } = useChartDataExport(viewContent, excelExportTitle);

  // Export click handler
  const handleClickExport = async exportId => {
    if (exportId === 'xlsx') {
      await doExport();
    } else {
      await exportToPNG();
    }
  };

  // Date change handler
  const handleDatesChange = (newStartDate, newEndDate) => {
    setParams(
      {
        startDate: newStartDate,
        endDate: newEndDate,
      },
      false,
    );
  };

  // Close click handler
  const handleClose = () => {
    setParams({
      startDate: null,
      endDate: null,
      reportCode: null,
    });
  };

  // Display the modal  if there is a report code in the url
  const isOpen = !!reportCode;

  const dashboardTitle = isExporting
    ? `${entityData?.name}, ${config?.dashboardName}, ${config?.name}`
    : config?.name;

  const modalTitle =
    isLoading || isLoadingEntityData
      ? 'Loading...'
      : `${entityData?.name}, ${config?.dashboardName}`;

  const exportWithLabels = exportFormatId === 'pngWithLabels';
  const exportWithTable = exportFormatId === 'pngWithTable';

  return (
    <MuiDialog
      scroll="paper"
      fullScreen
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
      style={{ left: fullScreen ? '0' : '6.25rem' }}
    >
      <DialogHeader handleClose={handleClose} title={modalTitle} />
      <ExportLoader $isExporting={isExportLoading}>
        <CircularProgress size={50} />
        <Box mt={3}>
          <Typography>Exporting...</Typography>
        </Box>
      </ExportLoader>
      <Wrapper ref={exportRef} $isExporting={isExporting}>
        <Container maxWidth="xl">
          <Header>
            <Box maxWidth={580}>
              <Heading variant="h3">{dashboardTitle}</Heading>
              {config?.description && <Description>{config.description}</Description>}
            </Box>
            <Toolbar $isExporting={isExporting}>
              {config?.type !== 'list' && (
                <SplitButton
                  options={exportFormats}
                  selectedId={exportFormatId}
                  setSelectedId={setExportFormatId}
                  onClick={handleClickExport}
                  ButtonComponent={WhiteButton}
                />
              )}
              <DateRangePicker
                isLoading={isLoading}
                startDate={startDate}
                endDate={endDate}
                granularity={config?.periodGranularity}
                onSetDates={handleDatesChange}
              />
            </Toolbar>
          </Header>
          <DashboardReport
            name={config?.name}
            reportCode={reportCode}
            isExporting={isExporting}
            startDate={startDate}
            endDate={endDate}
            exportOptions={{
              exportWithLabels,
              exportWithTable,
            }}
            isEnlarged
          />
          {isExporting && (
            <ExportDate startDate={viewContent.startDate} endDate={viewContent.endDate} />
          )}
        </Container>
      </Wrapper>
    </MuiDialog>
  );
};
