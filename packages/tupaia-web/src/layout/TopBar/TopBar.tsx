/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Logo } from './Logo';
import { UserMenu } from '../UserMenu';
import { useLandingPage } from '../../api/queries';
import { MOBILE_BREAKPOINT, TUPAIA_LIGHT_LOGO_SRC } from '../../constants';
import { EntitySearch } from '../../features';

const TOP_BAR_HEIGHT = 60;
const TOP_BAR_HEIGHT_MOBILE = 50;
/* Both min height and height must be specified due to bugs in Firefox flexbox, that means that topbar height will be ignored even if using flex-basis. */
const Header = styled.header<{
  $primaryColor?: string | null;
  $secondaryColor?: string | null;
}>`
  background-color: ${({ $primaryColor, theme }) =>
    $primaryColor || theme.palette.background.default};
  height: ${TOP_BAR_HEIGHT_MOBILE}px;
  min-height: ${TOP_BAR_HEIGHT_MOBILE}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  position: relative;
  padding: 0 0.625em;

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
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    height: ${TOP_BAR_HEIGHT}px;
    min-height: ${TOP_BAR_HEIGHT}px;
    align-items: initial;
    border-bottom: 1px solid rgba(151, 151, 151, 0.3);
  }
`;

export const TopBar = () => {
  const { landingPageUrlSegment } = useParams();
  // gets landing page data if landing page url segment is present, otherwise will return {}
  const { landingPage, isLandingPage } = useLandingPage(landingPageUrlSegment);

  // use the landing page settings if found, else the defaults
  const { primaryHexcode, secondaryHexcode, includeNameInHeader, name, logoUrl } = landingPage;
  return (
    <Header $primaryColor={primaryHexcode} $secondaryColor={secondaryHexcode}>
      <Logo
        logoSrc={logoUrl || TUPAIA_LIGHT_LOGO_SRC}
        displayName={includeNameInHeader}
        name={name}
      />
      {!isLandingPage && <EntitySearch />}
      <UserMenu />
    </Header>
  );
};
