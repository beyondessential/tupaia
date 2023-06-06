/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Logo } from './Logo';
import { UserMenu } from '../UserMenu';

/* Both min height and height must be specified due to bugs in Firefox flexbox, that means that topbar height will be ignored even if using flex-basis. */
const Header = styled.header<{
  $primaryColor?: string;
  $secondaryColor?: string;
}>`
  background-color: ${({ $primaryColor, theme }) =>
    $primaryColor || theme.palette.background.default};
  height: ${({ theme }) => theme.topBarHeight.mobile}px;
  min-height: ${({ theme }) => theme.topBarHeight.mobile}px;
  box-sizing: border-box;
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
    height: ${({ theme }) => theme.topBarHeight.default}px;
    min-height: ${({ theme }) => theme.topBarHeight.default}px;
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
