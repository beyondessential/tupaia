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
import * as COLORS from '../constants/colors';
import { Drawer, DrawerHeaderContent, DrawerFooter, DrawerHeader } from './Drawer';
import { CountryReportTable, SiteReportTable } from './Tables';
import { SiteAddress } from './SiteAddress';
import {
  getSitesForWeek,
  getActiveWeekCountryData,
  closeWeeklyReportsPanel,
  confirmWeeklyReportsData,
  checkWeeklyReportsPanelIsOpen,
} from '../store';
import { countryFlagImage } from '../utils';

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

const WeeklyReportsPaneSubmitButton = handleConfirm => () => {
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

const WeeklyReportPanelComponent = React.memo(
  ({ countryData, sitesData, isOpen, handleClose, handleConfirm }) => {
    if (countryData.length === 0 || sitesData.length === 0) {
      return null;
    }

    const [countryTableStatus, setCountryTableStatus] = useState(TABLE_STATUSES.STATIC);

    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const activeSite = sitesData[activeSiteIndex];
    const { syndromes: syndromesData } = activeSite;
    const [sitesTableStatus, setSitesTableStatus] = useState(TABLE_STATUSES.STATIC);

    const isSaving =
      countryTableStatus === TABLE_STATUSES.SAVING || sitesTableStatus === TABLE_STATUSES.SAVING;

    return (
      <Drawer open={isOpen} onClose={handleClose}>
        <DrawerHeader heading="Upcoming report" onClose={handleClose}>
          <DrawerHeaderContent
            heading="American Samoa"
            date="Week 9 Feb 25 - Mar 1, 2020"
            avatarUrl={countryFlagImage('as')}
          />
        </DrawerHeader>
        <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
        <GreySection disabled={isSaving}>
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
        <MainSection disabled={isSaving}>
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
          Action={WeeklyReportsPaneSubmitButton(handleConfirm)}
          helperText="Verify data to submit Weekly Report to Regional"
        />
      </Drawer>
    );
  },
);

WeeklyReportPanelComponent.propTypes = {
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

export const WeeklyReportPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyReportPanelComponent);
