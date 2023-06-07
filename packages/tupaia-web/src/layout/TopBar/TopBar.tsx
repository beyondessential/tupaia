/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Logo } from './Logo';
import { UserMenu } from '../UserMenu';

const TOP_BAR_HEIGHT = 60;
const TOP_BAR_HEIGHT_MOBILE = 50;
/* Both min height and height must be specified due to bugs in Firefox flexbox, that means that topbar height will be ignored even if using flex-basis. */
const Header = styled.header<{
  $primaryColor?: string;
  $secondaryColor?: string;
}>`
  background-color: ${({ $primaryColor, theme }) =>
    $primaryColor || theme.palette.background.default};
  height: ${TOP_BAR_HEIGHT_MOBILE}px;
  min-height: ${TOP_BAR_HEIGHT_MOBILE}px;
  display: flex;
  align-items: center;
  z-index: 1000;
  position: relative;
  padding: 0 0.625em;
  border-bottom: 1px solid rgba(151, 151, 151, 0.3);
  > * {
    background-color: ${({ $primaryColor, theme }) =>
      $primaryColor || theme.palette.background.default};
  }
  button,
  a,
  p,
  h1,
  li {
    color: ${({ $secondaryColor, theme }) => $secondaryColor || theme.palette.text.primary};
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    height: ${TOP_BAR_HEIGHT}px;
    min-height: ${TOP_BAR_HEIGHT}px;
    align-items: initial;
  }
`;

export const TopBar = () => {
  // When handing custom landing pages, pass the primary and secondary colors to the Header component
  return (
    <Header>
      <Logo />
      <UserMenu />
    </Header>
  );
};
