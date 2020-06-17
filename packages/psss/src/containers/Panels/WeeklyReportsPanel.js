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
import {
  SiteAddress,
  Drawer,
  DrawerFooter,
  DrawerTray,
  DrawerHeader,
  PercentageChangeCell,
} from '../../components';
import {
  getSitesForWeek,
  getActiveWeekCountryData,
  closeWeeklyReportsPanel,
  confirmWeeklyReportsData,
  checkWeeklyReportsPanelIsOpen,
} from '../../store';
import * as COLORS from '../../constants/colors';
import { CountryReportTable, SiteReportTable } from '../Tables';
import { countryFlagImage } from '../../utils';

const columns = [
  {
    title: 'Syndromes',
    key: 'title',
    sortable: false,
  },
  {
    title: '',
    key: 'percentageChange',
    CellComponent: PercentageChangeCell,
    sortable: false,
    width: '80px',
  },
  {
    title: 'Total Cases',
    key: 'totalCases',
    editable: true,
    sortable: false,
    width: '80px',
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

const StyledDrawer = styled(Drawer)`
  padding-bottom: 125px;
`;

const WeeklyReportsPanelSubmitButton = handleConfirm => () => {
  const handleClick = () => {
    handleConfirm();
  };
  return (
    <Button fullWidth onClick={handleClick}>
      Submit now
    </Button>
  );
};

const TABLE_STATUSES = {
  STATIC: 'static',
  SAVING: 'saving',
};

export const WeeklyReportsPanelComponent = React.memo(
  ({ countryData, sitesData, isOpen, handleClose, handleConfirm }) => {
    const [countryTableStatus, setCountryTableStatus] = useState(TABLE_STATUSES.STATIC);
    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const [sitesTableStatus, setSitesTableStatus] = useState(TABLE_STATUSES.STATIC);

    if (countryData.length === 0 || sitesData.length === 0) {
      return null;
    }

    const activeSite = sitesData[activeSiteIndex];
    const { syndromes: syndromesData } = activeSite;
    const isSaving =
      countryTableStatus === TABLE_STATUSES.SAVING || sitesTableStatus === TABLE_STATUSES.SAVING;

    return (
      <StyledDrawer open={isOpen} onClose={handleClose}>
        <DrawerTray heading="Upcoming report" onClose={handleClose} />
        <DrawerHeader
          trayHeading="Upcoming report"
          heading="American Samoa"
          date="Week 9 Feb 25 - Mar 1, 2020"
          avatarUrl={countryFlagImage('as')}
        />
        <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
        <GreySection disabled={isSaving} data-testid="country-reports">
          <EditableTableProvider
            columns={columns}
            data={countryData}
            tableStatus={countryTableStatus}
          >
            <CountryReportTable
              tableStatus={countryTableStatus}
              setTableStatus={setCountryTableStatus}
            />
          </EditableTableProvider>
        </GreySection>
        <MainSection disabled={isSaving} data-testid="site-reports">
          <ButtonSelect
            id="active-site"
            options={sitesData}
            onChange={setActiveSiteIndex}
            index={activeSiteIndex}
          />
          <SiteAddress address={activeSite.address} contact={activeSite.contact} />
          <Card variant="outlined" mb={3}>
            <EditableTableProvider
              columns={columns}
              data={syndromesData}
              tableStatus={sitesTableStatus}
            >
              <SiteReportTable
                tableStatus={sitesTableStatus}
                setTableStatus={setSitesTableStatus}
              />
            </EditableTableProvider>
          </Card>
        </MainSection>
        <DrawerFooter
          disabled={isSaving}
          Action={WeeklyReportsPanelSubmitButton(handleConfirm)}
          helperText="Verify data to submit Weekly Report to Regional"
        />
      </StyledDrawer>
    );
  },
);

WeeklyReportsPanelComponent.propTypes = {
  countryData: PropTypes.array.isRequired,
  sitesData: PropTypes.array.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isOpen: checkWeeklyReportsPanelIsOpen(state),
  countryData: getActiveWeekCountryData(state),
  sitesData: getSitesForWeek(state),
});

const mapDispatchToProps = dispatch => ({
  handleConfirm: () => dispatch(confirmWeeklyReportsData()),
  handleClose: () => dispatch(closeWeeklyReportsPanel()),
});

export const WeeklyReportsPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyReportsPanelComponent);
