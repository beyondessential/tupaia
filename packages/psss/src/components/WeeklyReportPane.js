/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import {
  ButtonSelect,
  FakeHeader,
  Button,
  Card,
  ErrorAlert,
  GreyOutlinedButton,
} from '@tupaia/ui-components';
import { PercentageChangeCell } from './Tables/TableCellComponents';
import { EditableTableContext, EditableTableProvider } from './Tables/EditableTable';
import * as COLORS from '../theme/colors';
import { Drawer, DrawerHeaderContent, DrawerFooter, DrawerHeader } from './Drawer';
import { DottedTable } from './Tables/TableTypes';
import { VerifiableTable } from './Tables/VerifiableTable';
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

const GreyHeader = styled(FakeHeader)`
  border: none;
`;

const GreySection = styled.section`
  background: ${COLORS.LIGHTGREY};
  box-shadow: 0 1px 0 ${COLORS.GREY_DE};
  padding: 25px 20px;
`;

const MainSection = styled.section`
  padding: 30px 20px;
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

const LayoutRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
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

const EditableTableSubmitButton = ({ setTableState }) => {
  const { fields, metadata } = useContext(EditableTableContext);

  const handleSubmit = () => {
    // POST DATA
    console.log('updated values...', fields, metadata);
    setTableState('static');
  };
  return <Button onClick={handleSubmit}>Save</Button>;
};

EditableTableSubmitButton.propTypes = {
  setTableState: PropTypes.func.isRequired,
};

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

const IndicatorsTable = () => {
  const { editableColumns, data } = useContext(EditableTableContext);
  return <DottedTable columns={editableColumns} data={data} />;
};

/*
 * WEEKLY REPORT PANE
 */
export const WeeklyReportPane = ({ data }) => {
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

  const handleEditClick = () => {
    setCountryTableState('editable');
  };

  const handleCancel = () => {
    setCountryTableState('static');
  };

  // ------- INDICATORS TABLE --------
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const indicatorsData = data[activeSiteIndex].indicators;
  const activeSite = data[activeSiteIndex];

  const [indicatorTableState, setIndicatorTableState] = useState('static');

  const handleIndicatorTableEditClick = () => {
    setIndicatorTableState('editable');
  };

  const handleIndicatorTableCancel = () => {
    setIndicatorTableState('static');
  };

  return (
    <React.Fragment>
      <Button onClick={handleOpen}>Save and submit</Button>
      <Drawer open={open} onClose={handleClose}>
        <DrawerHeader heading="Upcoming report" onClose={handleClose}>
          <DrawerHeaderContent heading="American Samoa" date="Week 9 Feb 25 - Mar 1, 2020" />
        </DrawerHeader>
        <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
        <GreySection>
          {/* ---------- Country Table ------------ */}
          <EditableTableProvider
            columns={columns}
            data={countryData}
            tableState={countryTableState}
            initialMetadata={verifiedStatus}
          >
            <LayoutRow>
              <Typography variant="h5">7/10 Sites Reported</Typography>
              <GreyOutlinedButton
                onClick={handleEditClick}
                disabled={countryTableState === 'editable'}
              >
                Edit
              </GreyOutlinedButton>
            </LayoutRow>
            <GreyHeader>
              <span>SYNDROMES</span>
              <span>TOTAL CASES</span>
            </GreyHeader>
            <VerifiableTable />
            {countryTableState === 'editable' && (
              <LayoutRow>
                <MuiLink>Reset and use Sentinel data</MuiLink>
                <div>
                  <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <EditableTableSubmitButton
                    tableState={countryTableState}
                    setTableState={setCountryTableState}
                  />
                </div>
              </LayoutRow>
            )}
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
            {/* --------------- Indicators Table ----------------- */}
            <EditableTableProvider
              columns={columns}
              data={indicatorsData}
              tableState={indicatorTableState}
            >
              <HeadingRow>
                <HeaderTitle>Sentinel Cases Reported</HeaderTitle>
                <GreyOutlinedButton
                  onClick={handleIndicatorTableEditClick}
                  disabled={indicatorTableState === 'editable'}
                >
                  Edit
                </GreyOutlinedButton>
              </HeadingRow>
              <FakeHeader>
                <span>SYNDROMES</span>
                <span>TOTAL CASES</span>
              </FakeHeader>
              <IndicatorsTable />
              {indicatorTableState === 'editable' && (
                <LayoutRow>
                  <MuiLink>Reset and use Sentinel data</MuiLink>
                  <div>
                    <Button variant="outlined" onClick={handleIndicatorTableCancel}>
                      Cancel
                    </Button>
                    <EditableTableSubmitButton
                      tableState={indicatorTableState}
                      setTableState={setIndicatorTableState}
                    />
                  </div>
                </LayoutRow>
              )}
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

WeeklyReportPane.propTypes = {
  data: PropTypes.array.isRequired,
};
