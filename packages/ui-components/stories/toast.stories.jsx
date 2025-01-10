import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { Toast } from '../src/components';

export default {
  title: 'Toast',
};

const Container = styled(MuiBox)`
  max-width: 530px;
  padding: 1rem;

  & > div {
    margin-bottom: 1rem;
  }
`;

export const toast = () => (
  <Container>
    <Toast>Note Successfully added</Toast>
    <Toast severity="error">A Server Error has occurred</Toast>
    <Toast timeout={3000}>Note Successfully added</Toast>
  </Container>
);
