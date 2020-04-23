import React from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';
import { Button, TextField } from '@tupaia/ui-components';

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
  padding: 1rem 0;
`;

const App = () => (
  <AppContainer>
    <Container>
      <Typography variant="h1" component="h1" gutterBottom>
        Pacific Syndromic Surveillance System
      </Typography>
      <Section>
        <Button variant="contained" color="primary">
          Button
        </Button>
        {/*<MuiButton variant="contained" color="primary">*/}
        {/*  Mui Button*/}
        {/*</MuiButton>*/}
        <br />
        <br />
        {/*<SuccessButton>Success Button</SuccessButton>*/}
        {/*<WarningButton>Warning Button</WarningButton>*/}
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

export default App;
