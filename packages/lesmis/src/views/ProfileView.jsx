import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';

const Container = styled(MuiContainer)`
  min-height: 85vh;
  padding-top: 5%;
`;

export const ProfileView = () => (
  <Container>
    <Typography variant="h1">Profile View</Typography>
  </Container>
);
