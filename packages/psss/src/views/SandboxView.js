/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { TextButton, FakeHeader, Button } from '@tupaia/ui-components';
import * as COLORS from '../theme/colors';
import { BorderlessTable, SimpleTable, DottedTable } from '../components/Tables/TableTypes';
import { SiteAddress, EditableTable } from '../components';

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

const WarningStyleText = styled.span`
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
`;

const SuccessStyleText = styled.span`
  color: ${props => props.theme.palette.success.main};
  font-weight: 500;
`;

const PercentageChangeCell = ({ percentageChange }) => {
  if (percentageChange > 0) {
    return <WarningStyleText>{`${percentageChange}%`}</WarningStyleText>;
  }

  return <SuccessStyleText>{percentageChange}</SuccessStyleText>;
};

PercentageChangeCell.propTypes = {
  percentageChange: PropTypes.string.isRequired,
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
  const [tableState, setTableState] = React.useState('static');

  const handleEditClick = () => {
    setTableState('editable');
  };

  const SubmitButton = props => {
    const handleSubmit = () => {
      // how to save values?
      // why am i losing focus?
      console.log('updated values...', props);
      setTableState('static');
    };
    return <Button onClick={handleSubmit}>Save</Button>;
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
          <EditableTable tableState={tableState} Action={SubmitButton} />
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
