import React from 'react';
import { Typography } from '@material-ui/core';
import { Button } from '@tupaia/ui-components';
import styled from 'styled-components';

const LeftColumn = styled.div`
  display: flex;
  align-items: center;
`;

const Pin = styled.img.attrs({
  src: '/tupaia-pin.svg',
  ['aria-hidden']: true, // this pin is not of any use to the screen reader, so hide from the screen reader
})`
  width: 1rem;
  height: auto;
  margin-right: 0.5rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.125rem;
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Text = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const InstallButton = styled(Button)`
  border-radius: 2rem;
  width: 7rem;
  font-weight: 400;
`;

export const InstallPrompt = ({ onInstall }) => {
  return (
    <>
      <LeftColumn>
        <Pin />
        <div>
          <Title>Tupaia Datatrak</Title>
          <Text>datatrak.tupaia.org</Text>
        </div>
      </LeftColumn>
      <InstallButton onClick={onInstall}>Install</InstallButton>
    </>
  );
};
