import { FlexSpaceBetween } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';

const Img = styled.img`
  height: 54px;
`;

const Container = styled(FlexSpaceBetween)`
  top: 30px;
  left: 50px;
  width: 236px;
  position: absolute;
`;

const Text = styled.p`
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 900;
  line-height: 140%;
  width: 190px;
  padding-top: 6px;
`;

export const Logo = () => {
  return (
    <Container>
      <Img aria-hidden src="/lesmis-logo.png" />
      <Text>Ministry of Education and Sports Lao PDR</Text>
    </Container>
  );
};
