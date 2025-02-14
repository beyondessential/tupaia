import React from 'react';
// import styled from 'styled-components';
// import { WarningCloud, Virus } from '@tupaia/ui-components';
import { DateToolbar, Container, Main, Sidebar, Header, HeaderTitle } from '../components';
import { CountriesTable, WeeklyReportsExportModal, ConfirmedCountriesCard } from '../containers';

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

export const CountriesReportsView = () => (
  <>
    <Header Title={<HeaderTitle title="Countries" />} ExportModal={WeeklyReportsExportModal} />
    <DateToolbar />
    <Container maxWidth="xl">
      <Main data-testid="countries-table">
        <CountriesTable />
      </Main>
      <Sidebar>
        <ConfirmedCountriesCard />
        {/* Temporarily removed for MVP release. Please do not delete */}
        {/* <Card variant="outlined"> */}
        {/*  <DataCardTabs data={tabData} /> */}
        {/* </Card> */}
      </Sidebar>
    </Container>
  </>
);
