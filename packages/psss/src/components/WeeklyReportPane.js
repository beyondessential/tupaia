/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import {
  FakeHeader,
  Drawer,
  DrawerFooter,
  DrawerHeader,
  Button,
  Card,
  ErrorAlert,
  TextButton,
  ButtonSelect,
} from '@tupaia/ui-components';
import { BorderlessTable, DottedTable } from './Tables/TableTypes';
import { PercentageChangeCell } from './Tables/TableCellComponents';
import * as COLORS from '../theme/colors';
import { EditableTable } from '../components';

const Action = () => {
  const handleClick = () => {
    console.log('click');
  };
  return (
    <Button fullWidth onClick={handleClick}>
      Submit now
    </Button>
  );
};

const siteData = [
  {
    code: 'afr',
    title: 'Acute Fever and Rash (AFR)',
    percentageChange: '15',
    totalCases: '15',
  },
  {
    code: 'dia',
    title: 'Diarrhoea (DIA)',
    percentageChange: '7',
    totalCases: '20',
  },
  {
    code: 'ili',
    title: 'Influenza-like Illness (ILI)',
    percentageChange: '10',
    totalCases: '115',
  },
  {
    code: 'pf',
    title: 'Prolonged Fever (AFR)',
    percentageChange: '-12',
    totalCases: '5',
  },
  {
    code: 'dil',
    title: 'Dengue-like Illness (DIL)',
    percentageChange: '9',
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
  },
];

const GreyHeader = styled(FakeHeader)`
  border: none;
`;

const GreySection = styled.section`
  background: #f9f9f9;
  box-shadow: 0 1px 0 ${COLORS.GREY_DE};
  padding: 25px 20px;
`;

const MainSection = styled.section`
  padding: 30px 20px;
`;

const AddressPlaceholder = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  border: 1px solid #dedee0;
  height: 200px;
  margin-bottom: 30px;
  margin-top: 20px;
`;

// Card Header - could be made into component?
const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  margin-left: 30px;
  margin-right: 30px;
`;

const HeaderTitle = styled(Typography)`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
`;

const options = [
  { name: 'Afghanistan', id: 'AF' },
  { name: 'Albania', id: 'AL' },
  { name: 'Algeria', id: 'DZ' },
  { name: 'Angola', id: 'AO' },
  { name: 'Anguilla', id: 'AI' },
  { name: 'Antarctica', id: 'AQ' },
  { name: 'Argentina', id: 'AR' },
  { name: 'Armenia', id: 'AM' },
  { name: 'Aruba', id: 'AW' },
  { name: 'Australia', id: 'AU' },
  { name: 'Austria', id: 'AT' },
];

export const WeeklyReportPane = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (event, isOpen) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const handleOpen = event => toggleDrawer(event, true);

  const handleClose = event => toggleDrawer(event, false);

  return (
    <React.Fragment>
      <Button onClick={handleOpen}>Save and submit</Button>
      <Drawer open={open} onClose={handleClose}>
        <DrawerHeader
          title="American Samoa"
          date="Week 9 Feb 25 - Mar 1, 20202"
          onClose={handleClose}
        />
        <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
        <GreySection>
          <GreyHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </GreyHeader>
          <BorderlessTable columns={columns} data={siteData} />
        </GreySection>
        <MainSection>
          <ButtonSelect id="button-select" options={options} />
          <AddressPlaceholder>Site Address</AddressPlaceholder>
          <Card variant="outlined" mb={3}>
            <HeadingRow>
              <HeaderTitle>Previous Week</HeaderTitle>
              <TextButton>Edit</TextButton>
            </HeadingRow>
            <FakeHeader>
              <span>SYNDROMES</span>
              <span>TOTAL CASES</span>
            </FakeHeader>
            <DottedTable columns={columns} data={siteData} />
          </Card>
        </MainSection>
        <DrawerFooter
          Action={Action}
          helperText="Verify data to submit Weekly Report to Regional"
        />
      </Drawer>
    </React.Fragment>
  );
};
