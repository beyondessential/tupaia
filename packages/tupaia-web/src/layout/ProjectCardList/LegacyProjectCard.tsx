/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Lock from '@material-ui/icons/Lock';
import Alarm from '@material-ui/icons/Alarm';
import { Link } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';

const Card = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto auto;
  gap: 16px;
  padding-bottom: 16px;
  border-radius: 3px;
  text-align: center;
  position: relative;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
  background: ${({ theme }) => theme.palette.common.white};
  color: #000000;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 500;
  margin-top: -8px;
  padding: 0 16px;
`;

const Header = styled.div<{
  $backgroundImage: string;
}>`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
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
  width: 120px;
  height: 85px;
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

const BaseLink = styled(Button).attrs({
  component: Link,
})``;

const StyledPendingButton = styled(BaseLink).attrs({
  variant: 'outlined',
  disabled: true,
})`
  background: #cde9ff;
  color: ${({ theme }) => theme.palette.primary.main};
  padding: 5px;
`;

export const LegacyProjectDeniedLink = ({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) => (
  <BaseLink to={url} color="primary" variant="outlined">
    <LockIcon />
    {children}
  </BaseLink>
);

export const LegacyProjectPendingLink = () => (
  <StyledPendingButton to="" disabled>
    <AlarmIcon />
    Approval in progress
  </StyledPendingButton>
);

export const LegacyProjectAllowedLink = ({ url }: { url: string }) => (
  <BaseLink to={url} variant="contained" color="primary">
    View project
  </BaseLink>
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
