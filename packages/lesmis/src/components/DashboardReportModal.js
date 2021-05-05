/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import BarChartIcon from '@material-ui/icons/BarChart';
import GridOnIcon from '@material-ui/icons/GridOn';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import {
  useMediaQuery,
  Slide,
  Typography,
  Dialog as MuiDialog,
  Container as MuiContainer,
  Button as MuiButton,
} from '@material-ui/core';
import * as COLORS from '../constants';
import { FlexSpaceBetween, FlexEnd, FlexStart } from './Layout';
import { DialogHeader } from './FullScreenDialog';
import { ToggleButton } from './ToggleButton';
import { YearSelector } from './YearSelector';
import { ChartTable, TABS } from './ChartTable';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Wrapper = styled.div`
  height: 100%;
  overflow: auto;
  background: ${COLORS.GREY_F9};
`;

const Container = styled(MuiContainer)`
  padding: 1.25rem 6.25rem 6.25rem;
  padding-bottom: 10vh;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled(FlexSpaceBetween)`
  min-height: 5.625rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  margin-bottom: 1.8rem;

  .MuiTextField-root {
    margin-right: 0;
  }
`;

const Heading = styled(Typography)`
  font-size: 1.25rem;
  line-height: 1.4rem;
  font-weight: 500;
`;

export const DashboardReportModal = ({
  name,
  dashboardGroupName,
  buttonText,
  entityCode,
  dashboardGroupId,
  reportId,
  periodGranularity,
  year,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(year);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(TABS.CHART);

  useEffect(() => {
    setSelectedYear(year);
  }, [open]);

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
      <MuiButton onClick={handleClickOpen} endIcon={<KeyboardArrowRightIcon />} color="primary">
        {buttonText}
      </MuiButton>
      <MuiDialog
        scroll="paper"
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        style={{ left: fullScreen ? '0' : '6.25rem' }}
      >
        <DialogHeader handleClose={handleClose} title={dashboardGroupName} />
        <Wrapper>
          <Container maxWidth={false}>
            <Header>
              <Heading variant="h3">{name}</Heading>
              <FlexStart>
                <YearSelector value={selectedYear} onChange={setSelectedYear} />
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
              entityCode={entityCode}
              dashboardGroupId={dashboardGroupId}
              reportId={reportId}
              periodGranularity={periodGranularity}
              year={selectedYear}
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
  reportId: PropTypes.string.isRequired,
  entityCode: PropTypes.string.isRequired,
  year: PropTypes.string,
  dashboardGroupId: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
  dashboardGroupName: PropTypes.string.isRequired,
};

DashboardReportModal.defaultProps = {
  year: null,
  periodGranularity: null,
};
