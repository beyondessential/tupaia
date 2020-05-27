/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ButtonSelect, Button, Card, ErrorAlert } from '@tupaia/ui-components';
import { PercentageChangeCell } from './Tables/TableCellComponents';
import { EditableTableContext, EditableTableProvider } from './Tables/EditableTable';
import * as COLORS from '../theme/colors';
import { Drawer, DrawerHeaderContent, DrawerFooter, DrawerHeader } from './Drawer';
import { VerifiableTable } from './Tables/VerifiableTable';
import { IndicatorsTable } from './Tables/IndicatorsTable';
import { SiteAddress } from './SiteAddress';

// dummy data
const countryData = [
  {
    id: 'afr',
    title: 'Acute Fever and Rash (AFR)',
    percentageChange: 4,
    totalCases: '15',
  },
  {
    id: 'dia',
    title: 'Diarrhoea (DIA)',
    percentageChange: 7,
    totalCases: '20',
  },
  {
    id: 'ili',
    title: 'Influenza-like Illness (ILI)',
    percentageChange: 15,
    totalCases: '115',
  },
  {
    id: 'pf',
    title: 'Prolonged Fever (AFR)',
    percentageChange: -12,
    totalCases: '5',
  },
  {
    id: 'dil',
    title: 'Dengue-like Illness (DIL)',
    percentageChange: 9,
    totalCases: '54',
  },
];

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

const verifiedStatus = countryData.reduce((state, item) => {
  if (item.percentageChange > 10) {
    return {
      ...state,
      [item.id]: 'expanded',
    };
  }
  return state;
}, {});

const WeeklyReportsPaneSubmitButton = () => {
  const handleClick = () => {
    console.log('click');
  };
  return (
    <Button fullWidth onClick={handleClick}>
      Submit now
    </Button>
  );
};

export const WeeklyReportPanel = ({ data }) => {
  // ------- DRAWER ---------------
  const [open, setOpen] = useState(false);
  const toggleDrawer = (event, isOpen) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const handleOpen = event => toggleDrawer(event, true);
  const handleClose = event => toggleDrawer(event, false);

  // ------- COUNTRY TABLE ----------
  const [countryTableState, setCountryTableState] = useState('static');

  // ------- INDICATORS TABLE --------
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const indicatorsData = data[activeSiteIndex].indicators;
  const activeSite = data[activeSiteIndex];

  const [indicatorTableState, setIndicatorTableState] = useState('static');

  return (
    <React.Fragment>
      <Button onClick={handleOpen}>Save and submit</Button>
      <Drawer open={open} onClose={handleClose}>
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
            <VerifiableTable tableState={countryTableState} setTableState={setCountryTableState} />
          </EditableTableProvider>
        </GreySection>
        <MainSection>
          <ButtonSelect
            id="button-select"
            options={data}
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
          Action={WeeklyReportsPaneSubmitButton}
          helperText="Verify data to submit Weekly Report to Regional"
        />
      </Drawer>
    </React.Fragment>
  );
};

WeeklyReportPanel.propTypes = {
  data: PropTypes.array.isRequired,
};
