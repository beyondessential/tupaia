import React from 'react';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';

const Container = styled.footer`
  padding-block: 1rem;
  padding-inline: 1.5rem;

  span,
  a {
    color: ${props => props.theme.palette.text.secondary};
    font-size: 12px;
    line-height: 14px;
    margin-inline-end: 1rem;
  }
`;

const date = new Date();

export const Footer = () => (
  <Container>
    <span>&copy;&nbsp;{date.getFullYear()} Beyond Essential</span>
    <MuiLink href="https://tupaia.org" target="_blank">
      tupaia.org
    </MuiLink>
  </Container>
);
