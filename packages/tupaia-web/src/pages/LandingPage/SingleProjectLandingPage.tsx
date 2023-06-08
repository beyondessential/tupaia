/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { LandingPageResponse } from '@tupaia/types';
import { Link } from 'react-router-dom';
import { PROJECT_ACCESS_TYPES } from '../../constants';

/**
 * This is the template for the content of a landing page if there is only one project
 */

const Wrapper = styled.div`
  max-width: 30em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
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

const ActionLink = styled(Link)`
  width: 75%;
  min-width: 10rem;
  background-color: ${props => props.theme.palette.common.white};
  color: ${props => props.theme.palette.common.black};
  text-transform: none;
  font-size: 0.975em;
  line-height: 1.5;
  padding: 1em;
  border-radius: 0.6em;
  text-decoration: none;
  ${ExtendedTitle} + & {
    margin-top: 2em;
  }
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    font-size: 1em;
  }
`;

interface SingleProjectLandingPageProps {
  project: LandingPageResponse['projects'][0];
  extendedTitle?: string;
  includeNameInHeader?: boolean;
  isUserLoggedIn: boolean;
}

export function SingleProjectLandingPage({
  project,
  extendedTitle,
  includeNameInHeader,
  isUserLoggedIn,
}: SingleProjectLandingPageProps) {
  //TODO: get this from project
  const accessType = PROJECT_ACCESS_TYPES.PENDING;
  //   const onClickActionButton = () => {
  //     const action = actions[accessType];
  //     if (!action) return;
  //     action(project);
  //   };
  const urls = {
    [PROJECT_ACCESS_TYPES.PENDING]: `/project/${project.code}`,
    [PROJECT_ACCESS_TYPES.ALLOWED]: `/project/${project.code}`,
    [PROJECT_ACCESS_TYPES.DENIED]: isUserLoggedIn ? `/request-access/${project.code}` : '/login',
  };

  const actionTexts = {
    [PROJECT_ACCESS_TYPES.PENDING]: 'Approval in progress',
    [PROJECT_ACCESS_TYPES.ALLOWED]: 'View data',
    [PROJECT_ACCESS_TYPES.DENIED]: isUserLoggedIn ? 'Request access' : 'Log in to view data',
  };

  return (
    <Wrapper>
      {extendedTitle && (
        <ExtendedTitle variant={includeNameInHeader ? 'h2' : 'h1'}>{extendedTitle}</ExtendedTitle>
      )}
      {/* Only display a button if access type is set, and button is disabled if access has not yet been granted */}
      {accessType && (
        <ActionLink
          to={urls[accessType]}
          //   disabled={accessType === PROJECT_ACCESS_TYPES.PENDING}
          //   disabled={accessType === PROJECT_ACCESS_TYPES.PENDING}
          //   onClick={onClickActionButton}
        >
          {actionTexts[accessType]}
        </ActionLink>
      )}
    </Wrapper>
  );
}
