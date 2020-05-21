/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { TextButton, FakeHeader, Button } from '@tupaia/ui-components';
import * as COLORS from '../theme/colors';
import { BorderlessTable, SimpleTable, DottedTable } from '../components/Tables/TableTypes';
import {
  SiteAddress,
  EditableTable,
  EditableTableAction,
  EditableTableProvider,
} from '../components';
import { PercentageChangeCell } from '../components/Tables/TableCellComponents';
import PropTypes from 'prop-types';

const Container = styled.div`
  width: 100%;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  > div {
    max-width: 900px;
    margin: 0 auto;
  }
`;

const Inner = styled.div`
  width: 500px;
  border: 1px solid ${COLORS.GREY_DE};
`;

const Box = styled.section`
  padding: 2rem 20px;
`;

const Heading = styled(Typography)`
  margin-left: 1rem;
  margin-bottom: 1rem;
`;

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

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

const editableTableColumns = [
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

export const SandboxView = () => {
  const [tableState, setTableState] = useState('static');

  const handleEditClick = () => {
    setTableState('editable');
  };

  const SubmitButton = ({ fields }) => {
    const handleSubmit = () => {
      console.log('updated values...', fields);
      setTableState('static');
    };

    return <Button onClick={handleSubmit}>Save</Button>;
  };

  SubmitButton.propTypes = {
    fields: PropTypes.any.isRequired,
  };

  return (
    <Container>
      <Inner>
        <Box>
          <HeadingRow>
            <Heading variant="h6" gutterBottom>
              Editable Table
            </Heading>
            <TextButton onClick={handleEditClick} disabled={tableState === 'editable'}>
              Edit
            </TextButton>
          </HeadingRow>
          {/*========== EDITABLE TABLE ================*/}
          <EditableTableProvider
            columns={editableTableColumns}
            data={siteData}
            tableState={tableState}
          >
            <FakeHeader>
              <span>SYNDROMES</span>
              <span>TOTAL CASES</span>
            </FakeHeader>
            <EditableTable Component={BorderlessTable} />
            {tableState === 'editable' && <EditableTableAction Component={SubmitButton} />}
          </EditableTableProvider>
        </Box>
        {/*========== TABLE STYLES ================*/}
        <Box>
          <Heading variant="h6" gutterBottom>
            Borderless Table
          </Heading>
          <FakeHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </FakeHeader>
          <BorderlessTable columns={columns} data={siteData} />
        </Box>
        <Box>
          <Heading variant="h6" gutterBottom>
            Dotted Table
          </Heading>
          <FakeHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </FakeHeader>
          <DottedTable columns={columns} data={siteData} />
        </Box>
        <Box>
          <Heading variant="h6" gutterBottom>
            Simple Table
          </Heading>
          <FakeHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </FakeHeader>
          <SimpleTable columns={columns} data={siteData} />
        </Box>

        <Box>
          <SiteAddress address={address} contact={contact} />
        </Box>
      </Inner>
    </Container>
  );
};
