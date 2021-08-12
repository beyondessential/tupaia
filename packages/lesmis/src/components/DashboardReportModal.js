/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import {
  Box,
  useMediaQuery,
  Slide,
  Typography,
  Dialog as MuiDialog,
  Container as MuiContainer,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DateRangePicker, WhiteButton } from '@tupaia/ui-components';
import * as COLORS from '../constants';
import { FlexColumn, FlexSpaceBetween, FlexStart } from './Layout';
import { DialogHeader } from './FullScreenDialog';
import { useDashboardReportDataWithConfig } from '../api/queries';
import { useUrlParams, useUrlSearchParams, useExportToPNG } from '../utils';
import { DashboardReport } from './DashboardReport';
import { SplitButton } from './SplitButton';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  background: ${COLORS.GREY_F9};
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

  .MuiTextField-root {
    margin-right: 0;
  }
`;

const Toolbar = styled(FlexStart)`
  display: ${props => (props.exporting ? 'none' : 'flex')};
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
  display: ${props => (props.exporting ? 'flex' : 'none')};
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1;
`;

const EXPORT_OPTIONS = [
  { id: 'xlsx', label: 'Export to XLSX' },
  { id: 'png', label: 'Export to PNG' },
];

export const DashboardReportModal = () => {
  const theme = useTheme();
  const [selectedExportId, setSelectedExportId] = useState(EXPORT_OPTIONS[1].id);
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { entityCode } = useUrlParams();
  const [{ startDate, endDate, reportCode }, setParams] = useUrlSearchParams();
  const { data, isLoading } = useDashboardReportDataWithConfig({
    entityCode,
    reportCode,
    startDate,
    endDate,
  });

  const { dashboardItemConfig: config } = data;

  const exportFilename = `export-${config?.name}-${new Date().toDateString()}`;

  const { isExporting, isExportLoading, exportRef, exportToPNG } = useExportToPNG(exportFilename);

  const handleDatesChange = (newStartDate, newEndDate) => {
    setParams(
      {
        startDate: newStartDate,
        endDate: newEndDate,
      },
      false,
    );
  };

  const handleClose = () => {
    setParams({
      startDate: null,
      endDate: null,
      reportCode: null,
    });
  };

  const handleClickExport = exportId => {
    if (exportId === 'png') {
      exportToPNG();
    }
  };

  const isOpen = !!reportCode;
  const title = isExporting
    ? `${entityCode}, ${config?.dashboardName}, ${config?.name}`
    : config?.name;

  return (
    <>
      <MuiDialog
        scroll="paper"
        fullScreen
        open={isOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
        style={{ left: fullScreen ? '0' : '6.25rem' }}
      >
        <DialogHeader
          handleClose={handleClose}
          title={config?.dashboardName ? config?.dashboardName : 'Loading...'}
        />
        <ExportLoader exporting={isExportLoading}>
          <CircularProgress size={50} />
          <Box mt={3}>
            <Typography>Exporting...</Typography>
          </Box>
        </ExportLoader>
        <Wrapper ref={exportRef}>
          <Container maxWidth="xl">
            <Header>
              <Box maxWidth={580}>
                <Heading variant="h3">{title}</Heading>
                {config?.description && <Description>{config.description}</Description>}
              </Box>
              <Toolbar exporting={isExporting}>
                <SplitButton
                  options={EXPORT_OPTIONS}
                  selectedId={selectedExportId}
                  setSelectedId={setSelectedExportId}
                  onClick={handleClickExport}
                  ButtonComponent={WhiteButton}
                />
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
              isEnlarged
            />
          </Container>
        </Wrapper>
      </MuiDialog>
    </>
  );
};
