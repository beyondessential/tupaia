import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
`;

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Text = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
`;

const Pin = styled.img.attrs({
  'aria-hidden': true,
  src: '/datatrak-pin.svg',
})`
  height: auto;
  margin-inline-end: 0.5rem;
  width: 1rem;
`;

export const InstallInstructions = () => {
  return (
    <Container>
      <Box>
        <Pin />
        <Title>Tupaia DataTrak</Title>
      </Box>
      <Text>
        To install the Tupaia DataTrak app, click the install button in the bottom right corner of
        your screen.
      </Text>
    </Container>
  );
};
