import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import {
  Alarm,
  Autorenew,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  ErrorOutline,
  NotificationImportant,
  Warning,
} from '@material-ui/icons';
import {
  ErrorAlert,
  Button,
  SuccessButton,
  WarningButton,
  TextField,
  Tabs,
  Tab,
  CardTab,
  CardTabList,
  CardTabPanel,
  CardTabPanels,
  CardTabs,
  Clipboard,
  Home,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Virus,
  WarningCloud,
} from '@tupaia/ui-components';

const AppContainer = styled.div`
  background: white;
`;

const Container = styled(MuiContainer)`
  padding-top: 1rem;
  padding-bottom: 1rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const Section = styled.section`
  padding: 1.1rem 0;
`;

const App = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <AppContainer>
      <Container>
        <Typography variant="h1" component="h1" gutterBottom>
          Pacific Syndromic Surveillance System
        </Typography>
        <Section>
          <Typography variant="h1" component="h2" gutterBottom>
            h1. Heading
          </Typography>
          <Typography variant="h2" gutterBottom>
            h2. Heading
          </Typography>
          <Typography variant="h3" gutterBottom>
            h3. Heading
          </Typography>
          <Typography variant="h4" gutterBottom>
            h4. Heading
          </Typography>
          <Typography variant="h5" gutterBottom>
            h5. Heading
          </Typography>
          <Typography variant="h6" gutterBottom>
            h6. Heading
          </Typography>
          <Typography variant="body1" gutterBottom>
            body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
            unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate
            numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
          </Typography>
          <Typography variant="body2" gutterBottom>
            body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
            unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate
            numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
          </Typography>
        </Section>
        <Section>
          <Button>Button</Button>
          <SuccessButton>Success Button</SuccessButton>
          <WarningButton>Warning Button</WarningButton>
        </Section>
        <Section>
          <WarningCloud />
          <Clipboard />
          <Dashboard />
          <Home />
          <Virus />
          <Alarm />
          <CalendarToday />
          <Autorenew />
          <ChevronRight />
          <ChevronLeft />
        </Section>
        <Section>
          <ErrorAlert>ILI Above Threshold. Please review and verify data.</ErrorAlert>
        </Section>
        <Section>
          <Tabs indicatorColor="primary" textColor="primary">
            <Tab>
              <Dashboard /> Dashboard
            </Tab>
            <Tab>
              <Warning /> Alerts
            </Tab>
          </Tabs>
        </Section>
        <Section>
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
                  <Typography variant="body2" gutterBottom>
                    body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis
                    tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus,
                    cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi quidem
                    quibusdam.
                  </Typography>
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
        </Section>
        <Section>
          <Dialog onClose={handleClose} open={open}>
            <DialogTitle onClose={handleClose}>Archive Alert</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Confirm</Button>
            </DialogActions>
          </Dialog>
          <Button onClick={handleClickOpen}>Open modal</Button>
        </Section>
        <Section>
          <TextField name="simpleText" label="Simple text field" autoComplete="off" />
          <TextField name="defaultValue" label="Default Value" defaultValue="Default Value" />
          <TextField name="required" label="Required field" required />
          <TextField name="disabled" label="Disabled" disabled />
          <TextField name="placeholder" label="Placeholder text" placeholder="Placeholder here" />
          <TextField name="noLabel" placeholder="No label" />
          <TextField
            name="readOnly"
            label="Read only"
            InputProps={{ readOnly: true }}
            defaultValue="Some saved content"
          />
          <TextField name="helperText" label="Helper text" helperText="Some important text" />
          <TextField name="errorState" label="Error state" error />
          <TextField name="errorMessage" label="Error message" error helperText="Incorrect entry" />
          <TextField name="number" label="Number" type="number" />
          <TextField name="email" label="Email" type="email" />
          <TextField name="password" label="Password" type="password" />
        </Section>
      </Container>
    </AppContainer>
  );
};

export default App;
