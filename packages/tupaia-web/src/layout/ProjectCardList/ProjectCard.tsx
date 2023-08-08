/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ComponentType } from 'react';
import styled from 'styled-components';
import Lock from '@material-ui/icons/Lock';
import Alarm from '@material-ui/icons/Alarm';
import { darken, lighten } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { SingleProject } from '../../types';
import { MODAL_ROUTES } from '../../constants';
import { RouterButton } from '../../components';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  min-height: 20rem;
  border-radius: 5px;
  background: ${({ theme }) => theme.projectCard.background};
  color: white;
  box-sizing: border-box;
  align-items: flex-start;
  justify-content: space-between;
  text-align: left;

  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding: 2.5rem;
    height: 24rem;
  }

  button {
    margin-top: auto;
  }
`;

const LogoWrapper = styled.div`
  height: 4.875rem;
  margin-bottom: 0.625rem;
`;

const Logo = styled.div`
  position: relative;
  background: white;
  width: 4.875rem;
  height: 100%;
  border-radius: 3px;
  overflow: hidden;

  > img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
  }
`;

const Title = styled(Typography)`
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 500;
  margin-bottom: 0.625rem;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.2;
  margin-bottom: 0.625rem;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const CountryText = styled(Text)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TextWrapper = styled.div`
  height: 100%;
`;

const BaseLink = styled(RouterButton)`
  background: ${({ theme }) => theme.palette.primary.main};
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  color: white;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.2;
  text-transform: none;
  padding: 0.6875rem 1.25rem;
  min-width: 11.5rem;

  &:hover {
    background: ${({ theme }) => darken(theme.palette.primary.main, 0.1)};
  }

  .MuiSvgIcon-root {
    font-size: 1.2em;
  }
`;

const OutlineLink = styled(BaseLink).attrs({
  variant: 'outlined',
})`
  border: 1px solid ${({ theme }) => lighten(theme.palette.primary.main, 0.25)};
  color: ${({ theme }) => lighten(theme.palette.primary.main, 0.25)};
  background: transparent;
  min-width: 10rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  &.Mui-disabled {
    border-color: ${({ theme }) => theme.palette.text.secondary};
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

interface LinkProps {
  url: string;
  isLandingPage?: boolean;
}

export const ProjectDeniedLink = ({ url }: LinkProps) => (
  <OutlineLink to={url} startIcon={<Lock />}>
    Request access
  </OutlineLink>
);

export const ProjectLoginLink = ({ routerState }: { routerState?: Record<string, any> }) => (
  <OutlineLink modal={MODAL_ROUTES.LOGIN} routerState={routerState}>
    Log in
  </OutlineLink>
);

export const ProjectPendingLink = () => (
  <OutlineLink to={''} disabled={true} startIcon={<Alarm />}>
    Approval in progress
  </OutlineLink>
);

export const ProjectAllowedLink = ({ url, isLandingPage }: LinkProps) => (
  <BaseLink to={url} target={isLandingPage ? '_blank' : '_self'}>
    View Project
  </BaseLink>
);

interface ProjectCardProps extends Partial<SingleProject> {
  ProjectButton: ComponentType;
}

function getCountryNames(countryNames: ProjectCardProps['names']) {
  if (countryNames && countryNames.length < 3) {
    return countryNames.sort().join(', ');
  }

  return 'Multiple countries';
}

function getDescription(text: ProjectCardProps['description'], limit: number = 190) {
  return text && text.length > limit ? `${text.substring(0, limit)}...` : text;
}

export const ProjectCard = ({
  name,
  description,
  logoUrl,
  names,
  ProjectButton,
}: ProjectCardProps) => (
  <Card>
    <LogoWrapper>
      {logoUrl && (
        <Logo>
          <img alt={`${name} logo`} src={logoUrl} />
        </Logo>
      )}
    </LogoWrapper>
    <Body>
      <Title>{name}</Title>
      <TextWrapper>
        <Text>{getDescription(description)}</Text>
        <CountryText>{getCountryNames(names)}</CountryText>
      </TextWrapper>
    </Body>
    <ProjectButton />
  </Card>
);
