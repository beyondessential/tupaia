/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { DEFAULT_URL, TUPAIA_LIGHT_LOGO_SRC } from '../../constants';

const LogoWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  max-height: 80%;
  width: auto;
  max-width: 50px;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    max-width: 100%;
  }
`;

const LogoLink = styled(Link)`
  cursor: pointer;
  pointer-events: auto;
  padding: 0.5em;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
`;

const Name = styled(Typography)`
  font-style: normal;
  font-weight: ${props => props.theme.typography.fontWeightBold};
  font-size: 1rem;
  line-height: 1;
  letter-spacing: 0.1rem;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    font-size: 1.2rem;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    font-size: 1.5rem;
  }
`;

const NameWrapper = styled.div`
  max-width: 100%;
  ${LogoImage} + & {
    margin-left: 1.2rem;
  }
`;

// If logo is from a custom landing page, don't wrap in clickable button
const LogoComponent = ({
  isCustomLandingPage,
  children,
}: {
  isCustomLandingPage: boolean;
  children: ReactNode[];
}) => (isCustomLandingPage ? <>{children}</> : <LogoLink to={DEFAULT_URL}>{children}</LogoLink>);

export const Logo = () => {
  // Here is where we should swap out the logo for the custom landing page logo if applicable
  const logoSrc = TUPAIA_LIGHT_LOGO_SRC;

  // These will later come from custom landing pages, where applicable
  const displayName = false;
  const name = '';
  return (
    <LogoWrapper>
      <LogoComponent isCustomLandingPage={false}>
        <LogoImage src={logoSrc} alt="Logo" />
        {/** If a custom landing page has set to display the name in the header, display it here */}
        {displayName && (
          <NameWrapper>
            <Name variant="h1">{name}</Name>
          </NameWrapper>
        )}
      </LogoComponent>
    </LogoWrapper>
  );
};
