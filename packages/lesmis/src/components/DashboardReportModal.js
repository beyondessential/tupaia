/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import BarChartIcon from '@material-ui/icons/BarChart';
import GridOnIcon from '@material-ui/icons/GridOn';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/core/styles';
import MuiDialog from '@material-ui/core/Dialog';
import { Chart, Table } from '@tupaia/ui-components/lib/chart';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import * as COLORS from '../constants';
import { FlexSpaceBetween, FlexEnd } from './Layout';
import { DialogHeader } from './FullScreenDialog';
import { FetchLoader } from './FetchLoader';
import { TABS } from './Report';
import { useDashboardReportData } from '../api/queries';
import { ToggleButton } from './ToggleButton';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Wrapper = styled.div`
  height: 100%;
  overflow: auto;
  background: ${COLORS.GREY_F9};
`;

const Container = styled.div`
  max-width: 1130px;
  padding: 20px 100px 100px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled(FlexSpaceBetween)`
  min-height: 90px;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  margin-bottom: 30px;
`;

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 20px;
  line-height: 23px;
`;

const ChartWrapper = styled.div`
  flex: 1;
  display: flex;
  padding: 1.25rem 1.875rem 0;
  width: 100%;

  .MuiAlert-root {
    position: relative;
    top: -0.625rem; // offset the chart wrapper padding
  }
`;

export const DashboardReportModal = ({
  buttonText,
  entityCode,
  dashboardGroupId,
  reportId,
  periodGranularity,
  year,
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(TABS.CHART);
  const { data: viewContent, isLoading, isError, error } = useDashboardReportData({
    entityCode,
    dashboardGroupId,
    reportId,
    periodGranularity,
    year,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  return (
    <>
      <Button onClick={handleClickOpen} endIcon={<ArrowRightIcon />} color="primary">
        {buttonText}
      </Button>
      <MuiDialog
        scroll="paper"
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        style={{ left: fullScreen ? '0' : '100px' }}
      >
        <DialogHeader handleClose={handleClose} title="Textbooks & teacher guides" />
        <Wrapper>
          <Container>
            <Header>
              <Heading>Textbook Shortage: by Grade and Subject</Heading>
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
            <FetchLoader isLoading={isLoading} isError={isError} error={error}>
              {selectedTab === TABS.CHART ? (
                <ChartWrapper>
                  <Chart viewContent={viewContent} isEnlarged />
                </ChartWrapper>
              ) : (
                <Table viewContent={viewContent} />
              )}
            </FetchLoader>
          </Container>
        </Wrapper>
      </MuiDialog>
    </>
  );
};

DashboardReportModal.propTypes = {
  buttonText: PropTypes.string.isRequired,
  reportId: PropTypes.string.isRequired,
  entityCode: PropTypes.string.isRequired,
  year: PropTypes.string,
  dashboardGroupId: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
};

DashboardReportModal.defaultProps = {
  year: null,
  periodGranularity: null,
};
