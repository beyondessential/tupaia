/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  EditableTableProvider,
  ButtonSelect,
  Button,
  Card,
  ErrorAlert,
} from '@tupaia/ui-components';
import { PercentageChangeCell } from './Tables/TableCellComponents';
import * as COLORS from '../theme/colors';
import { Drawer, DrawerHeaderContent, DrawerFooter, DrawerHeader } from './Drawer';
import { VerifiableTable, IndicatorsTable } from './Tables';
import { SiteAddress } from './SiteAddress';
import {
  getSitesForWeek,
  getActiveCountryWeekData,
  closeWeeklyReportsPanel,
  confirmWeeklyReportsData,
  checkWeeklyReportsPanelIsOpen,
} from '../store';

const columns = [
  {
    title: 'Title',
    key: 'title',
    width: '300px',
  },
  {
    title: 'Percentage Increase',
    key: 'percentageChange',
    CellComponent: PercentageChangeCell,
  },
  {
    title: 'Total Cases',
    key: 'totalCases',
    editable: true,
  },
];

const MainSection = styled.section`
  position: relative;
  padding: 30px 20px;

  &:after {
    display: ${props => (props.disabled ? 'block' : 'none')};
    position: absolute;
    content: '';
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    opacity: 0.5;
  }
`;

const GreySection = styled(MainSection)`
  background: ${COLORS.LIGHTGREY};
  box-shadow: 0 1px 0 ${COLORS.GREY_DE};
  padding: 25px 20px;
`;

const WeeklyReportsPaneSubmitButton = confirmData => () => {
  const handleClick = () => {
    confirmData();
  };
  return (
    <Button fullWidth onClick={handleClick}>
      Submit now
    </Button>
  );
};

const TABLE_STATE = {
  STATIC: 'static',
  SAVING: 'saving',
};

const WeeklyReportPanelComponent = React.memo(
  ({ activeCountryWeekData, siteWeeksData, isOpen, handleClose, confirmData }) => {
    if (activeCountryWeekData.length === 0 || siteWeeksData.length === 0) {
      return null;
    }

    const [countryTableState, setCountryTableState] = useState(TABLE_STATE.STATIC);

    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const indicatorsData = siteWeeksData[activeSiteIndex].indicators;
    const activeSite = siteWeeksData[activeSiteIndex];
    const [indicatorTableState, setIndicatorTableState] = useState(TABLE_STATE.STATIC);

    // Derive from store??
    const verifiedStatus = activeCountryWeekData.reduce((state, item) => {
      if (item.percentageChange > 10) {
        return {
          ...state,
          [item.id]: '',
        };
      }
      return state;
    }, {});

    const isSaving =
      countryTableState === TABLE_STATE.SAVING || indicatorTableState === TABLE_STATE.SAVING;

    return (
      <Drawer open={isOpen} onClose={handleClose}>
        <DrawerHeader heading="Upcoming report" onClose={handleClose}>
          <DrawerHeaderContent heading="American Samoa" date="Week 9 Feb 25 - Mar 1, 2020" />
        </DrawerHeader>
        <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
        <GreySection disabled={isSaving}>
          <EditableTableProvider
            columns={columns}
            data={activeCountryWeekData}
            tableState={countryTableState}
            initialMetadata={verifiedStatus}
          >
            <VerifiableTable tableState={countryTableState} setTableState={setCountryTableState} />
          </EditableTableProvider>
        </GreySection>
        <MainSection disabled={isSaving}>
          <ButtonSelect
            id="button-select"
            options={siteWeeksData}
            onChange={setActiveSiteIndex}
            index={activeSiteIndex}
          />
          <SiteAddress address={activeSite.address} contact={activeSite.contact} />
          <Card variant="outlined" mb={3}>
            <EditableTableProvider
              columns={columns}
              data={indicatorsData}
              tableState={indicatorTableState}
            >
              <IndicatorsTable
                tableState={indicatorTableState}
                setTableState={setIndicatorTableState}
              />
            </EditableTableProvider>
          </Card>
        </MainSection>
        <DrawerFooter
          disabled={isSaving}
          Action={WeeklyReportsPaneSubmitButton(confirmData)}
          helperText="Verify data to submit Weekly Report to Regional"
        />
      </Drawer>
    );
  },
);

WeeklyReportPanelComponent.propTypes = {
  activeCountryWeekData: PropTypes.array.isRequired,
  siteWeeksData: PropTypes.array.isRequired,
  confirmData: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isOpen: checkWeeklyReportsPanelIsOpen(state),
  activeCountryWeekData: getActiveCountryWeekData(state),
  siteWeeksData: getSitesForWeek(state),
});

const mapDispatchToProps = dispatch => ({
  confirmData: () => dispatch(confirmWeeklyReportsData()),
  handleClose: () => dispatch(closeWeeklyReportsPanel()),
});

export const WeeklyReportPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyReportPanelComponent);
