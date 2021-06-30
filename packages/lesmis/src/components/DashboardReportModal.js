/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import BarChartIcon from '@material-ui/icons/BarChart';
import GridOnIcon from '@material-ui/icons/GridOn';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import {
  Box,
  useMediaQuery,
  Slide,
  Typography,
  Dialog as MuiDialog,
  Container as MuiContainer,
  Button as MuiButton,
} from '@material-ui/core';
import { DateRangePicker } from '@tupaia/ui-components';
import * as COLORS from '../constants';
import { FlexSpaceBetween, FlexEnd, FlexStart } from './Layout';
import { DialogHeader } from './FullScreenDialog';
import { ToggleButton } from './ToggleButton';
import { ChartTable, TABS } from './ChartTable';
import { useDashboardReportData } from '../api/queries';
import { useUrlSearchParams } from '../utils';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Wrapper = styled.div`
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

export const DashboardReportModal = ({
  name,
  dashboardCode,
  dashboardName,
  buttonText,
  entityCode,
  reportCode,
  periodGranularity,
  viewConfig,
}) => {
  const { code: itemCode, legacy } = viewConfig;
  const [{ startDate, endDate, reportCode: selectedReportCode }, setParams] = useUrlSearchParams();
  const isOpen = reportCode === selectedReportCode;
  const [open, setOpen] = useState(isOpen);
  const [selectedTab, setSelectedTab] = useState(TABS.CHART);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: viewContent, isLoading, isError, error } = useDashboardReportData({
    entityCode,
    dashboardCode,
    reportCode,
    itemCode,
    periodGranularity,
    legacy,
    startDate,
    endDate,
  });

  const handleDatesChange = (newStartDate, newEndDate) => {
    setParams({
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  // set reportCode param after the modal render is rendered to improve the responsiveness
  // of the modal transition
  const onRendered = () => {
    setParams({
      reportCode,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setParams({
      startDate: null,
      endDate: null,
      reportCode: null,
    });
  };

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  return (
    <>
      <MuiButton onClick={handleClickOpen} endIcon={<KeyboardArrowRightIcon />} color="primary">
        {buttonText}
      </MuiButton>
      <MuiDialog
        onRendered={onRendered}
        scroll="paper"
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        style={{ left: fullScreen ? '0' : '6.25rem' }}
      >
        <DialogHeader handleClose={handleClose} title={dashboardName} />
        <Wrapper>
          <Container maxWidth={false}>
            <Header>
              <Box maxWidth={580}>
                <Heading variant="h3">{name}</Heading>
                {viewConfig?.description && <Description>{viewConfig.description}</Description>}
              </Box>
              <FlexStart>
                <DateRangePicker
                  isLoading={isLoading}
                  startDate={startDate}
                  endDate={endDate}
                  granularity={periodGranularity}
                  onSetDates={handleDatesChange}
                />
              </FlexStart>
            </Header>
            <FlexEnd>
              <ToggleButtonGroup onChange={handleTabChange} value={selectedTab} exclusive>
                <ToggleButton value={TABS.TABLE}>
                  <GridOnIcon />
                </ToggleButton>
                <ToggleButton value={TABS.CHART}>
                  <BarChartIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </FlexEnd>
            <ChartTable
              viewContent={{ ...viewConfig, data: viewContent }}
              isLoading={isLoading}
              isError={isError}
              error={error}
              selectedTab={selectedTab}
            />
          </Container>
        </Wrapper>
      </MuiDialog>
    </>
  );
};

DashboardReportModal.propTypes = {
  name: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  reportCode: PropTypes.string.isRequired,
  entityCode: PropTypes.string.isRequired,
  dashboardCode: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
  dashboardName: PropTypes.string.isRequired,
  viewConfig: PropTypes.object.isRequired,
};

DashboardReportModal.defaultProps = {
  periodGranularity: null,
};
