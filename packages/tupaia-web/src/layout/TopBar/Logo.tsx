import React, { ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { MOBILE_BREAKPOINT } from '../../constants';

const LogoWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 3rem;
  max-height: 100%;
  width: auto;
  max-width: 70px;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    max-width: 100%;
  }
`;

const LogoLink = styled(Link)`
  cursor: pointer;
  padding: 0.3em 0.5em 0.3em 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  text-decoration: none;
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
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
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
}) => (isCustomLandingPage ? <>{children}</> : <LogoLink to="/">{children}</LogoLink>);

interface LogoProps {
  logoSrc?: string;
  displayName?: boolean | null;
  name?: string;
}

export const Logo = ({ logoSrc, displayName = false, name = '' }: LogoProps) => {
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
