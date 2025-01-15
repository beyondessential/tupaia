import React from 'react';
import styled from 'styled-components';
import { Logo } from './Logo';
import { UserMenu } from '../UserMenu';
import { useLandingPage } from '../../api/queries';
import {
  MOBILE_BREAKPOINT,
  TOP_BAR_HEIGHT,
  TOP_BAR_HEIGHT_MOBILE,
  TUPAIA_LIGHT_LOGO_SRC,
} from '../../constants';
import { EntitySearch } from '../../features';

/* Both min height and height must be specified due to bugs in Firefox flexbox, that means that topbar height will be ignored even if using flex-basis. */
const Header = styled.header<{
  $primaryColor?: string | null;
  $secondaryColor?: string | null;
  $isLandingPage?: boolean;
}>`
  background-color: ${({ theme, $primaryColor }) =>
    $primaryColor || theme.palette.background.default};
  height: ${TOP_BAR_HEIGHT_MOBILE};
  min-height: ${TOP_BAR_HEIGHT_MOBILE};
  display: flex;
  justify-content: space-between;
  align-items: center;
  // Needs to be higher than 1000 as leaflet sets z-index of map controls to 1000
  z-index: 1100;
  position: relative;
  padding: 0 0.625em;
  border-bottom: ${({ $isLandingPage, theme }) => {
    if ($isLandingPage) return 'none';
    return `1px solid ${theme.palette.background.paper}`;
  }};

  > * {
    background-color: ${({ theme, $primaryColor }) =>
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
    height: ${TOP_BAR_HEIGHT};
    min-height: ${TOP_BAR_HEIGHT};
    align-items: initial;
  }
`;

export const TopBar = () => {
  // gets landing page data if landing page url segment is present, otherwise will return {}
  const { landingPage, isLandingPage } = useLandingPage();
  // use the landing page settings if found, else the defaults
  const { primaryHexcode, secondaryHexcode, includeNameInHeader, name, logoUrl } = landingPage;
  return (
    <Header
      $primaryColor={primaryHexcode}
      $secondaryColor={secondaryHexcode}
      $isLandingPage={isLandingPage}
    >
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
