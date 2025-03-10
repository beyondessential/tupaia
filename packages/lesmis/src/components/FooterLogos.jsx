import React from 'react';
import styled from 'styled-components';
import { FlexStart } from './Layout';

const Logo = styled.img`
  position: relative;
  width: auto;
  height: 40px;
  margin-right: 14px;
  border-radius: 2px;
`;

export const FooterLogos = React.memo(() => (
  <FlexStart>
    <Logo src="/images/unicef-logo.png" />
    <Logo src="/images/eu-logo.png" />
  </FlexStart>
));
