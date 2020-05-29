/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ButtonSelect, Button, Card, ErrorAlert } from '@tupaia/ui-components';
import { PercentageChangeCell } from './Tables/TableCellComponents';
import { EditableTableProvider, EditableTableLoader } from './Tables/EditableTable';
import * as COLORS from '../theme/colors';
import { Drawer, DrawerHeaderContent, DrawerFooter, DrawerHeader } from './Drawer';
import { VerifiableTable } from './Tables/VerifiableTable';
import { IndicatorsTable } from './Tables/IndicatorsTable';
import { SiteAddress } from './SiteAddress';
import {
  getSiteWeeks,
  getCountryWeeks,
  closeWeeklyReportsPanel,
  confirmWeeklyReportsData,
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

const GreySection = styled.section`
  background: ${COLORS.LIGHTGREY};
  box-shadow: 0 1px 0 ${COLORS.GREY_DE};
  padding: 25px 20px;
`;

const MainSection = styled.section`
  padding: 30px 20px;
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

// Todo: refactor tableState into an object that is stored in table/constants in ui-components
const STATIC = 'static';

const WeeklyReportPanelComponent = React.memo(
  ({ countryWeeksData, siteWeeksData, isOpen, handleClose, confirmData }) => {
    if (countryWeeksData.length === 0 || siteWeeksData.length === 0) {
      return null;
    }

    // ------- COUNTRY TABLE ----------
    const countryData = countryWeeksData[0].indicators;
    const [countryTableState, setCountryTableState] = useState(STATIC);

    // Derive from store??
    const verifiedStatus = countryData.reduce((state, item) => {
      if (item.percentageChange > 10) {
        return {
          ...state,
          [item.id]: 'expanded',
        };
      }
      return state;
    }, {});

    // ------- INDICATORS TABLE --------
    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const indicatorsData = siteWeeksData[activeSiteIndex].indicators;
    const activeSite = siteWeeksData[activeSiteIndex];
    //
    const [indicatorTableState, setIndicatorTableState] = useState(STATIC);

    return (
      <React.Fragment>
        <Drawer open={isOpen} onClose={handleClose}>
          <DrawerHeader heading="Upcoming report" onClose={handleClose}>
            <DrawerHeaderContent heading="American Samoa" date="Week 9 Feb 25 - Mar 1, 2020" />
          </DrawerHeader>
          <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
          <GreySection>
            <EditableTableProvider
              columns={columns}
              data={countryData}
              tableState={countryTableState}
              initialMetadata={verifiedStatus}
            >
              <VerifiableTable
                tableState={countryTableState}
                setTableState={setCountryTableState}
              />
            </EditableTableProvider>
          </GreySection>
          <MainSection>
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
            Action={WeeklyReportsPaneSubmitButton(confirmData)}
            helperText="Verify data to submit Weekly Report to Regional"
          />
        </Drawer>
      </React.Fragment>
    );
  },
);

WeeklyReportPanelComponent.propTypes = {
  countryWeeksData: PropTypes.array.isRequired,
  siteWeeksData: PropTypes.array.isRequired,
  confirmData: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isOpen: state.weeklyReports.panelIsOpen,
  countryWeeksData: getCountryWeeks(state),
  siteWeeksData: getSiteWeeks(state),
});

const mapDispatchToProps = dispatch => ({
  confirmData: () => dispatch(confirmWeeklyReportsData()),
  handleClose: () => dispatch(closeWeeklyReportsPanel()),
});

export const WeeklyReportPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyReportPanelComponent);
