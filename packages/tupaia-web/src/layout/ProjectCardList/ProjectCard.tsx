import React, { ComponentType } from 'react';
import styled, { css } from 'styled-components';
import Lock from '@material-ui/icons/Lock';
import Alarm from '@material-ui/icons/Alarm';
import { darken, lighten } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Button as UIButton } from '@tupaia/ui-components';
import { SingleProject } from '../../types';
import { MODAL_ROUTES, MOBILE_BREAKPOINT } from '../../constants';
import { RouterButton } from '../../components';
import { useNavigate } from 'react-router-dom';
import { useEditUser } from '../../api/mutations';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  min-height: 24.4375rem;
  border-radius: 5px;
  background: ${({ theme }) => theme.palette.background.default};
  color: white;
  box-sizing: border-box;
  align-items: flex-start;
  justify-content: space-between;

  text-align: left;

  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding: 2.5rem;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding-top: 2.5rem;
    padding-left: 1.875rem;
    padding-right: 1.875rem;
  }
`;

const LogoWrapper = styled.div`
  height: 4.875rem;
  margin-bottom: 0.625rem;
`;

const Logo = styled.div`
  position: relative;
  background: white;
  width: 5rem;
  height: 5rem;
  border-radius: 3px;
  overflow: hidden;

  > img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
    padding: 0.3rem;
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
  display: flex;
  flex-direction: column;
`;

const TextWrapper = styled.div`
  height: 100%;
`;

const ButtonStyles = css`
  background: ${({ theme }) => theme.palette.primary.main};
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  color: white;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.2;
  text-transform: none;
  padding: 0.6875rem 1.25rem;
  width: 100%;

  &:hover {
    background: ${({ theme }) => darken(theme.palette.primary.main, 0.1)};
  }

  .MuiSvgIcon-root {
    font-size: 1.2em;
  }
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-bottom: 0.875rem;
  }
`;

const BaseLink = styled(RouterButton)`
  ${ButtonStyles}
`;

const Button = styled(UIButton)`
  ${ButtonStyles}
`;

const OutlineLink = styled(BaseLink).attrs({
  variant: 'outlined',
})`
  border: 1px solid ${({ theme }) => lighten(theme.palette.primary.main, 0.25)};
  color: ${({ theme }) => lighten(theme.palette.primary.main, 0.25)};
  background: transparent;
  text-transform: none;
  line-height: 1.2;
  padding: 0.6875rem 1.8rem;
  min-width: 10rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  &.Mui-disabled {
    border-color: ${({ theme }) => theme.palette.text.secondary};
    color: ${({ theme }) => theme.palette.text.secondary};
  }
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-bottom: 0.875rem;
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

type ProjectAllowedLinkProps = LinkProps & {
  projectId: string;
};

export const ProjectAllowedLink = ({ projectId, url, isLandingPage }: ProjectAllowedLinkProps) => {
  const navigate = useNavigate();
  const { mutate } = useEditUser(() => {
    if (isLandingPage) {
      window.open(url, '_blank');
    } else {
      navigate(url);
    }
  });
  const handleSelectProject = () => {
    mutate({ projectId });
  };
  return (
    <Button
      onClick={handleSelectProject}
      tabIndex="0"
      role="link"
      aria-label="Select and navigate to project"
    >
      View project
    </Button>
  );
};

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
          <img alt={`${name} logo`} crossOrigin="" src={logoUrl} />
        </Logo>
      )}
    </LogoWrapper>
    <Title>{name}</Title>
    <Body>
      <TextWrapper>
        <Text>{getDescription(description)}</Text>
        <CountryText>{getCountryNames(names)}</CountryText>
      </TextWrapper>
    </Body>
    <ProjectButton />
  </Card>
);
