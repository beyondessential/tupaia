import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import * as COLORS from '../constants/colors';

const footerFontColor = '#c4c4c4';

const Container = styled.footer`
  background: ${COLORS.DARKGREY};
  padding: 1rem;

  span,
  a {
    color: ${footerFontColor};
    font-size: 12px;
    line-height: 14px;
    margin-right: 1rem;
  }
`;

const date = new Date();

export const Footer = () => (
  <Container maxWidth="xl">
    <MuiContainer maxWidth="xl">
      <span>&copy; {date.getFullYear()} Beyond Essential</span>
      <MuiLink href="https://tupaia.org">tupaia.org</MuiLink>
    </MuiContainer>
  </Container>
);
