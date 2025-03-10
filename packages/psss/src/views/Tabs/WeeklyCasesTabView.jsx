import React from 'react';
// import styled from 'styled-components';
// import Typography from '@material-ui/core/Typography';
// import { Button, WarningCloud, Virus } from '@tupaia/ui-components';
import { Container, Main, Sidebar } from '../../components';
import { CountryTable, UpcomingReportCard } from '../../containers';

// const ExampleContent = styled.div`
//   padding: 3rem 1rem;
//   text-align: center;
// `;

// const tabData = [
//   {
//     label: (
//       <>
//         <WarningCloud /> 3 Active Alerts
//       </>
//     ),
//     content: <ExampleContent>Table Content</ExampleContent>,
//   },
//   {
//     label: (
//       <>
//         <Virus /> 1 Active Outbreak
//       </>
//     ),
//     content: <ExampleContent>Table Content</ExampleContent>,
//   },
// ];

// const StyledButton = styled(Button)`
//   margin-top: 1rem;
//   margin-bottom: 1rem;
// `;

// const DateSubtitle = styled(Typography)`
//   margin-top: 1rem;
//   margin-bottom: 1rem;
//   font-weight: 400;
//   color: ${props => props.theme.palette.text.secondary};
// `;

export const WeeklyCasesTabView = () => {
  return (
    <Container maxWidth="xl">
      <Main data-testid="country-table">
        <CountryTable />
      </Main>
      <Sidebar>
        <UpcomingReportCard />
        {/* Temporarily removed for MVP release. Please do not delete */}
        {/* <Card variant="outlined"> */}
        {/*  <DataCardTabs data={tabData} /> */}
        {/* </Card> */}
      </Sidebar>
    </Container>
  );
};
