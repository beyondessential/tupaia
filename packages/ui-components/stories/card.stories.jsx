import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import { Error, ErrorOutline, NotificationImportant, Assignment } from '@material-ui/icons';
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  Button,
  CircleMeter,
  BarMeter,
  CardTab,
  CardTabList,
  CardTabPanel,
  CardTabPanels,
  CardTabs,
} from '../src/components';
import * as COLORS from './story-utils/theme/colors';

export default {
  title: 'Card',
  component: Card,
};

const Container = styled(MuiBox)`
  max-width: 460px;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  .MuiCard-root {
    min-height: 120px;
  }
`;

export const border = () => (
  <Container>
    <Card variant="outlined" />
  </Container>
);

export const withoutBorder = () => (
  <Container>
    <Card elevation={0} />
  </Container>
);

export const shadow = () => (
  <Container>
    <Card />
  </Container>
);

export const simpleExample = () => (
  <Container>
    <Card variant="outlined" mb={3}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Heading
        </Typography>
        <Typography variant="body2" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde
          suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde
          suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <br />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  </Container>
);

const StyledCardContent = styled(CardContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const reportsExample = () => (
  <Container>
    <Card variant="outlined">
      <CardHeader title="Current reports submitted" label="Week 10" />
      <StyledCardContent>
        <Typography variant="h3">11/22 Countries</Typography>
        <CircleMeter value={11} total={22} />
      </StyledCardContent>
    </Card>
  </Container>
);

const StyledButton = styled(Button)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

export const submissionExample = () => (
  <Container>
    <Card variant="outlined">
      <CardHeader color="error" title="Submission due in 3 days" label={<Error color="error" />} />
      <CardContent>
        <Typography variant="h4">Week 11</Typography>
        <Typography variant="h4" gutterBottom>
          Upcoming Report
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          Feb 25, 2020 - Mar 1, 2020
        </Typography>
        <StyledButton fullWidth>Review and Submit now</StyledButton>
      </CardContent>
      <CardFooter>
        <BarMeter value={22} total={30} legend="Sites reported" />
      </CardFooter>
    </Card>
  </Container>
);

const FakeTable = styled.section`
  display: flex;
  background: white;
  border: 2px dashed black;
  height: 300px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const cardTabsExample = () => {
  return (
    <Container>
      <Card variant="outlined">
        <CardTabs>
          <CardTabList>
            <CardTab>
              <ErrorOutline /> 3 Active Alerts
            </CardTab>
            <CardTab>
              <NotificationImportant /> 1 Active Outbreak
            </CardTab>
          </CardTabList>
          <CardTabPanels>
            <CardTabPanel>
              <FakeTable>Active Alerts Data</FakeTable>
            </CardTabPanel>
            <CardTabPanel>
              <FakeTable>Active Outbreak Data</FakeTable>
            </CardTabPanel>
          </CardTabPanels>
        </CardTabs>
      </Card>
    </Container>
  );
};

export const cardTabsSectionsExample = () => {
  return (
    <Container>
      <Card variant="outlined">
        <CardTabs>
          <CardTabList>
            <CardTab>
              <ErrorOutline /> 3 Active Alerts
            </CardTab>
            <CardTab>
              <NotificationImportant /> 1 Active Outbreak
            </CardTab>
          </CardTabList>
          <CardTabPanels>
            <CardTabPanel>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            </CardTabPanel>
            <CardTabPanel>
              <p>Sed ut perspiciatis unde omnis iste natus error sit </p>
              <ul>
                <li>voluptatem accusantium</li>
                <li>doloremque laudantium</li>
                <li>voluptatem accusantium</li>
              </ul>
            </CardTabPanel>
          </CardTabPanels>
        </CardTabs>
      </Card>
    </Container>
  );
};

const StyledDiv = styled.div`
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

  svg {
    margin-right: 10px;
    color: ${COLORS.TEXT_MIDGREY};
  }
`;

const HeaderLabel = styled(Typography)`
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  color: ${COLORS.TEXT_MIDGREY};
`;

export const tableExample = () => (
  <Container>
    <Card variant="outlined" mb={3}>
      <StyledDiv>
        <HeaderTitle>
          <Assignment />
          Previous Week
        </HeaderTitle>
        <HeaderLabel>Week 9</HeaderLabel>
      </StyledDiv>
      <FakeTable>Example data</FakeTable>
    </Card>
  </Container>
);
