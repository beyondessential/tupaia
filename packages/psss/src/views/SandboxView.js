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
  EditableTableContext,
  EditableTableProvider,
  FakeHeader,
  Button,
  Card,
  GreyOutlinedButton,
} from '@tupaia/ui-components';
import * as COLORS from '../theme/colors';
import { BorderlessTable, SimpleTable, DottedTable } from '../components/Tables/Table';
import { PercentageChangeCell } from '../components/Tables/TableCellComponents';
import { VerifiableTable } from '../components/Tables/VerifiableTable';

const siteData = [
  {
    id: 'afr',
    title: 'Acute Fever and Rash (AFR)',
    percentageChange: 5,
    totalCases: '5',
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
    percentageChange: 14,
    totalCases: '115',
    alert: true,
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
    percentageChange: 12,
    totalCases: '54',
    alert: true,
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

const Container = styled.div`
  width: 100%;
  max-width: 600px;
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
  margin-top: 1rem;
  margin-left: 1rem;
  margin-bottom: 0.8rem;
`;

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const StyledCard = styled(Card)`
  padding-bottom: 2px;
`;

const verifiedStatus = siteData.reduce((state, item) => {
  if (item.alert) {
    return {
      ...state,
      [item.id]: 'expanded',
    };
  }
  return state;
}, {});

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

export const SandboxView = () => {
  const [tableState, setTableState] = useState('static');

  const handleEditClick = () => {
    setTableState('editable');
  };

  const handleCancel = () => {
    setTableState('static');
  };

  return (
    <Container>
      <Box>
        <StyledCard variant="outlined" mb={3}>
          <Heading variant="h6" gutterBottom>
            Simple Table
          </Heading>
          <FakeHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </FakeHeader>
          <SimpleTable columns={columns} data={siteData} />
        </StyledCard>
      </Box>
      <Box>
        <StyledCard variant="outlined" mb={3}>
          <Heading variant="h6" gutterBottom>
            Borderless Table
          </Heading>
          <FakeHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </FakeHeader>
          <BorderlessTable columns={columns} data={siteData} />
        </StyledCard>
      </Box>
      <Box>
        <StyledCard variant="outlined" mb={3}>
          <Heading variant="h6" gutterBottom>
            Dotted Table
          </Heading>
          <FakeHeader>
            <span>SYNDROMES</span>
            <span>TOTAL CASES</span>
          </FakeHeader>
          <DottedTable columns={columns} data={siteData} />
        </StyledCard>
      </Box>
    </Container>
  );
};

// const tableExamples = () => {
//   return (
//     <Container>
//       <Inner>
//         <Box>
//           <HeadingRow>
//             <Heading variant="h6">Editable Table</Heading>
//             <GreyOutlinedButton onClick={handleEditClick} disabled={tableState === 'editable'}>
//               Edit
//             </GreyOutlinedButton>
//           </HeadingRow>
//           {/*========== EDITABLE TABLE ================*/}
//           <EditableTableProvider
//             columns={editableTableColumns}
//             data={siteData}
//             tableState={tableState}
//             initialMetadata={verifiedStatus}
//           >
//             <FakeHeader>
//               <span>SYNDROMES</span>
//               <span>TOTAL CASES</span>
//             </FakeHeader>
//             <VerifiableTable />
//             {tableState === 'editable' && (
//               <ActionsRow>
//                 <MuiLink>Reset and use Sentinel data</MuiLink>
//                 <div>
//                   <Button variant="outlined" onClick={handleCancel}>
//                     Cancel
//                   </Button>
//                   <SubmitButton tableState={tableState} setTableState={setTableState} />
//                 </div>
//               </ActionsRow>
//             )}
//           </EditableTableProvider>
//         </Box>
//       </Inner>
//     </Container>
//   );
// };
