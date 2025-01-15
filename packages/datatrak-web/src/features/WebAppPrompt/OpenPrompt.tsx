import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #333333;
`;

const LeftColumn = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 0.6rem;
  color: #ffffff;
`;

const Text = styled(Typography)`
  font-size: 0.6rem;
  color: #eaeaea;
`;

const Logo = styled.img.attrs({
  src: '/datatrak-logo-white.svg',
  alt: 'Tupaia Datatrak logo',
})`
  width: auto;
  height: 1.6rem;
  margin-right: 0.6rem;
`;

const OpenButton = styled(Button)`
  border-radius: 1rem;
  width: 3.5rem;
  font-size: 10px;
  height: 26px;
`;

export const OpenPrompt = () => {
  console.log('open');
  return (
    <Container>
      <LeftColumn>
        <Logo />
        <div>
          <Title>Tupaia Datatrak is best used with the app on mobile</Title>
          <Text>Open in the Tupaia Datatrak app</Text>
        </div>
      </LeftColumn>
      <OpenButton>Open</OpenButton>
    </Container>
  );
};
