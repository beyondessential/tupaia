/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Button, Typography } from '@material-ui/core';
import { useCustomLandingPages } from './useCustomLandingPages';
import { useAuth } from './useAuth';
import { getProjectAccessType } from '../../utils';
import { PROJECT_ACCESS_TYPES } from '../../constants';
import { useNavigation } from './useNavigation';
import { LoadingScreen } from '../LoadingScreen';

/**
 * This is the template for the content of a landing page if there is only one project
 */

const Wrapper = styled.div`
  max-width: 30em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  min-height: 55vh;
`;

const ExtendedTitle = styled(Typography)`
  color: ${props => props.theme.palette.common.white};
  font-weight: ${props => props.theme.typography.fontWeightBold};
  font-size: 1.5em;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    font-size: 2em;
  }
`;

const ActionButton = styled(Button)`
  width: 75%;
  min-width: 10rem;
  background-color: ${props => props.theme.palette.common.white};
  color: ${props => props.theme.palette.common.black};
  text-transform: none;
  font-size: 0.975em;
  line-height: 1.5;
  padding: 1em;
  border-radius: 0.6em;
  ${ExtendedTitle} + & {
    margin-top: 2em;
  }
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    font-size: 1em;
  }
`;

export function SingleProjectLandingPage() {
  const {
    customLandingPageSettings: { extendedTitle, includeNameInHeader },
    projects,
  } = useCustomLandingPages();

  const { isUserLoggedIn } = useAuth();
  const { navigateToLogin, navigateToProject, navigateToRequestProjectAccess } = useNavigation();

  const actionTexts = {
    [PROJECT_ACCESS_TYPES.PENDING]: 'Approval in progress',
    [PROJECT_ACCESS_TYPES.ALLOWED]: 'View data',
    [PROJECT_ACCESS_TYPES.DENIED]: isUserLoggedIn ? 'Request access' : 'Log in to view data',
  };

  const [project] = projects;

  const accessType = getProjectAccessType(project);

  const actions = {
    [PROJECT_ACCESS_TYPES.ALLOWED]: navigateToProject,
    [PROJECT_ACCESS_TYPES.DENIED]: isUserLoggedIn
      ? navigateToRequestProjectAccess
      : navigateToLogin,
  };

  const onClickActionButton = () => {
    const action = actions[accessType];
    if (!action) return;
    action(project);
  };

  return (
    <Wrapper>
      {extendedTitle && (
        <ExtendedTitle variant={includeNameInHeader ? 'h2' : 'h1'}>{extendedTitle}</ExtendedTitle>
      )}
      {/* Only display a button if access type is set, and button is disabled if access has not yet been granted */}
      {accessType && (
        <ActionButton
          variant="contained"
          disabled={accessType === PROJECT_ACCESS_TYPES.PENDING}
          onClick={onClickActionButton}
        >
          {actionTexts[accessType]}
        </ActionButton>
      )}
    </Wrapper>
  );
}
