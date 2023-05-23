/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Lock from '@material-ui/icons/Lock';
import { darken } from '@material-ui/core/styles';
import Alarm from '@material-ui/icons/Alarm';
import { Button, Typography } from '@material-ui/core';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2.5rem;
  border-radius: 5px;
  background: #2e2f33;
  color: white;
  height: 24rem;
  box-sizing: border-box;
  align-items: flex-start;
  justify-content: space-between;

  button {
    margin-top: auto;
  }
`;

const Logo = styled.div`
  position: relative;
  background: white;
  width: 5rem;
  height: 5rem;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.625rem;

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
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const BLUE = '#1978D4';

const StyledButton = styled(Button)`
  background: ${BLUE};
  border: 1px solid ${BLUE};
  color: white;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.2;
  text-transform: none;
  padding: 0.6875rem 1.25rem;
  min-width: 11.5rem;

  &:hover {
    background: ${darken(BLUE, 0.1)};
  }

  .MuiSvgIcon-root {
    font-size: 1.2em;
  }
`;

const OutlineButton = styled(StyledButton)`
  border: 1px solid ${BLUE};
  color: ${BLUE};
  background: transparent;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

// eslint-disable-next-line react/prop-types
export const ProjectDeniedButton = ({ onClick }) => (
  <OutlineButton onClick={onClick} startIcon={<Lock />}>
    Request access
  </OutlineButton>
);

export const ProjectLoginButton = ({ onClick }) => (
  <OutlineButton onClick={onClick}>Log in</OutlineButton>
);

// eslint-disable-next-line react/prop-types
export const ProjectPendingButton = ({ onClick }) => (
  <OutlineButton onClick={onClick} startIcon={<Alarm />}>
    Approval in progress
  </OutlineButton>
);
// eslint-disable-next-line react/prop-types
export const ProjectAllowedButton = ({ onClick }) => (
  <StyledButton onClick={onClick}>View project</StyledButton>
);

function getCountryNames(projectName, countryNames) {
  if (projectName === 'Disaster Response') {
    return 'Global';
  }

  if (countryNames.length < 3) {
    return countryNames.sort().join(', ');
  }

  return 'Multiple countries';
}

function getDescription(text, limit = 190) {
  return text.length > limit ? `${text.substring(0, limit)}...` : text;
}

export const ProjectCard = ({ name, description, logoUrl, names, ProjectButton }) => (
  <Card>
    {logoUrl && (
      <Logo>
        <img alt="project logo" src={logoUrl} />
      </Logo>
    )}
    <Body>
      <Title>{name}</Title>
      <div>
        <Text>{getDescription(description)}</Text>
        <Text style={{ color: '#9BA0A6' }}>{getCountryNames(name, names)}</Text>
      </div>
    </Body>
    <ProjectButton />
  </Card>
);

ProjectCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  ProjectButton: PropTypes.func.isRequired,
  logoUrl: PropTypes.string,
};

ProjectCard.defaultProps = {
  logoUrl: '',
};
