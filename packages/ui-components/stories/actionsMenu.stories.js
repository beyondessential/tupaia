/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Alert from '@material-ui/lab/Alert';
import MuiBox from '@material-ui/core/Box';
import { ActionsMenu } from '../src/components/ActionsMenu';

export default {
  title: 'ActionsMenu',
};

const Container = styled(MuiBox)`
  padding: 1rem 1rem 1rem 10rem;
`;

const StyledAlert = styled(Alert)`
  margin: 1rem;
`;

export const AllActionsMenu = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);

  return (
    <Container>
      {alertMessage ? <StyledAlert severity="info">{alertMessage}</StyledAlert> : ''}

      <ActionsMenu
        options={[
          { label: 'Uluru', action: () => setAlertMessage('Uluru was selected') },
          { label: 'Taranaki', action: () => setAlertMessage('Taranaki was selected') },
        ]}
      />
    </Container>
  );
};
