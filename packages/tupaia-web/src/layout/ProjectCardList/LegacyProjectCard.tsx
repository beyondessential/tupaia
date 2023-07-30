/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { To } from 'react-router';
import Lock from '@material-ui/icons/Lock';
import Alarm from '@material-ui/icons/Alarm';
import { RouterButton } from '../../components';

const Card = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto auto;
  gap: 1rem;
  padding-bottom: 1rem;
  border-radius: 3px;
  text-align: center;
  position: relative;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
  background: ${({ theme }) => theme.palette.common.white};
  color: #000000;
`;

const Title = styled.div`
  font-size: 1.375rem;
  font-weight: 500;
  margin-top: -8px;
  padding: 0 1rem;
`;

const Header = styled.div<{
  $backgroundImage: string;
}>`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 0.9375rem;
  height: 120px;
  background-color: ${({ theme }) => theme.projectCard.fallBack}; /* fallback color */
  background-image: ${({ $backgroundImage }) => `url(${$backgroundImage})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  > img {
    width: 100%;
    height: 100%;
  }
`;

const Logo = styled.div`
  background: white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  position: absolute;
  width: 7.5rem;
  height: 5.3125;
  bottom: -15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;

  > img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const FullWidthRow = styled.div`
  grid-column: 1 / -1;
  padding: 0 16px;
`;

const Countries = styled(FullWidthRow)`
  margin-bottom: 8px;
  font-size: 14px;
  opacity: 0.7;
  padding: 0;
`;

const Footer = styled(FullWidthRow)`
  display: grid;
  align-content: end;
  padding: 0 16px;
`;

const LockIcon = styled(Lock)`
  margin-right: 5px;
`;

const AlarmIcon = styled(Alarm)`
  margin-right: 5px;
`;

const StyledRouterButton = styled(RouterButton)`
  color: white;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.2;
  text-transform: none;
  padding: 0.6875rem 1.25rem;
  min-width: 11.5rem;
`;

const StyledPendingButton = styled(RouterButton).attrs({
  variant: 'outlined',
  disabled: true,
  to: '',
})`
  background: #cde9ff;
  color: ${({ theme }) => theme.palette.primary.main};
  padding: 5px;
`;

export const LegacyProjectDeniedLink = ({
  to,
  children,
  routerState,
}: {
  to: To;
  children: ReactNode;
  routerState?: Record<string, unknown> | null;
}) => (
  <RouterButton to={to} color="primary" variant="outlined" routerState={routerState}>
    <LockIcon />
    {children}
  </RouterButton>
);

export const LegacyProjectPendingLink = () => (
  <StyledPendingButton>
    <AlarmIcon />
    Approval in progress
  </StyledPendingButton>
);

export const LegacyProjectAllowedLink = ({ to }: { to: To }) => (
  <StyledRouterButton to={to}>View project</StyledRouterButton>
);

interface LegacyProjectCardProps {
  name: string;
  description: string;
  imageUrl: string;
  logoUrl: string;
  names: string[];
  ProjectButton: any;
}

export const LegacyProjectCard = ({
  name,
  description,
  imageUrl,
  logoUrl,
  names,
  ProjectButton,
}: LegacyProjectCardProps) => {
  return (
    <Card>
      <Header $backgroundImage={imageUrl}>
        {logoUrl && (
          <Logo>
            <img alt="project logo" src={logoUrl} />
          </Logo>
        )}
      </Header>
      <Title>{name}</Title>
      <FullWidthRow>{description}</FullWidthRow>
      <Footer>
        <Countries>{name === 'Disaster Response' ? 'Global' : names.sort().join(', ')}</Countries>
        <ProjectButton />
      </Footer>
    </Card>
  );
};
