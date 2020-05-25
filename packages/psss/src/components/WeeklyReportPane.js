/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import PropTypes from 'prop-types';
import {
  FakeHeader,
  Drawer,
  DrawerFooter,
  DrawerHeader,
  Button,
  Card,
  ErrorAlert,
  ButtonSelect,
  GreyOutlinedButton,
} from '@tupaia/ui-components';
import { PercentageChangeCell } from './Tables/TableCellComponents';
import {
  EditableTableAction,
  EditableTableContext,
  EditableTableProvider,
} from './Tables/EditableTable';
import * as COLORS from '../theme/colors';
import { DottedTable } from './Tables/TableTypes';
import { VerifiableTable } from './Tables/VerifiableTable';
import { SiteAddress } from './SiteAddress';

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
    id: 'afr',
    title: 'Acute Fever and Rash (AFR)',
    percentageChange: '15',
    totalCases: '15',
  },
  {
    id: 'dia',
    title: 'Diarrhoea (DIA)',
    percentageChange: '7',
    totalCases: '20',
  },
  {
    id: 'ili',
    title: 'Influenza-like Illness (ILI)',
    percentageChange: '10',
    totalCases: '115',
  },
  {
    id: 'pf',
    title: 'Prolonged Fever (AFR)',
    percentageChange: '-12',
    totalCases: '5',
  },
  {
    id: 'dil',
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

// Card Header - could be made into component?
const MainHeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
`;

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

const address = {
  name: 'Tafuna Health Clinic',
  district: 'Tafuna Western District 96799,',
  country: 'American Samoa',
};

const contact = {
  name: 'Shakila Naidu',
  department: 'Ministry of Health',
  email: 'Shakila@gmail.com',
};

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const editableColumns = [
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

const SubmitButton = ({ setTableState }) => {
  const { fields, metadata } = useContext(EditableTableContext);

  const handleSubmit = () => {
    // POST DATA
    console.log('updated values...', fields, metadata);
    setTableState('static');
  };
  return <Button onClick={handleSubmit}>Save</Button>;
};

SubmitButton.propTypes = {
  setTableState: PropTypes.func.isRequired,
};

const verifiedStatus = siteData.reduce((state, item) => {
  if (item.percentageChange > 10) {
    return {
      ...state,
      [item.id]: 'expanded',
    };
  }
  return state;
}, {});

export const WeeklyReportPane = () => {
  const { fields, metadata } = useContext(EditableTableContext);
  const [open, setOpen] = useState(false);

  const toggleDrawer = (event, isOpen) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const handleOpen = event => toggleDrawer(event, true);

  const handleClose = event => toggleDrawer(event, false);

  const [tableState, setTableState] = useState('static');

  const handleEditClick = () => {
    setTableState('editable');
  };

  const handleCancel = () => {
    setTableState('static');
  };

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
          <MainHeadingRow>
            <Typography variant="h5">7/10 Sites Reported</Typography>
            <GreyOutlinedButton onClick={handleEditClick} disabled={tableState === 'editable'}>
              Edit
            </GreyOutlinedButton>
          </MainHeadingRow>
          <GreyHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </GreyHeader>
          <EditableTableProvider
            columns={editableColumns}
            data={siteData}
            tableState={tableState}
            initialMetadata={verifiedStatus}
          >
            <VerifiableTable />
            {tableState === 'editable' && (
              <ActionsRow>
                <MuiLink>Reset and use Sentinel data</MuiLink>
                <div>
                  <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <SubmitButton tableState={tableState} setTableState={setTableState} />
                </div>
              </ActionsRow>
            )}
          </EditableTableProvider>
        </GreySection>
        <MainSection>
          <ButtonSelect id="button-select" options={options} />
          <SiteAddress address={address} contact={contact} />
          <Card variant="outlined" mb={3}>
            <HeadingRow>
              <HeaderTitle>Sentinel Cases Reported</HeaderTitle>
              <GreyOutlinedButton>Edit</GreyOutlinedButton>
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
