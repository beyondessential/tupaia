import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import { FOOTER_HEIGHT } from '../constants';
import { FooterLogos } from './FooterLogos';

const footerFontColor = '#c4c4c4';

const Container = styled.footer`
  display: flex;
  align-items: center;
  height: ${FOOTER_HEIGHT};
  background: #283238;

  .MuiContainer-root {
    display: flex;
  }

  span,
  .MuiLink-root {
    color: ${footerFontColor};
    font-size: 12px;
    line-height: 14px;
  }

  span {
    margin-right: 1rem;
  }

  .MuiLink-root {
    margin-right: 2rem;
  }
`;

const InnerContainer = styled(MuiContainer)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const date = new Date();

export const Footer = () => (
  <Container>
    <InnerContainer maxWidth="xl">
      <span>&copy; {date.getFullYear()} Beyond Essential</span>
      <MuiLink href="https://tupaia.org">tupaia.org</MuiLink>
      <FooterLogos />
    </InnerContainer>
  </Container>
);
