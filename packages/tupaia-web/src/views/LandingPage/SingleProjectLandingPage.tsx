import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';
import { PROJECT_ACCESS_TYPES, MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';
import { getProjectAccessType } from '../../utils';
import { SingleLandingPage, SingleProject } from '../../types';

/**
 * This is the template for the content of a landing page if there is only one project
 */

const Wrapper = styled.div`
  max-width: 30em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto 0; // centre the content in the remaining page space
  min-height: 300px; // handle landscape mobile screens
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

const ActionLink = styled(Button)`
  text-align: center;
  width: 75%;
  min-width: 10rem;
  background-color: ${props => props.theme.palette.common.white};
  color: ${props => props.theme.palette.common.black};
  text-transform: none;
  font-size: 0.975rem;
  line-height: 1.5;
  padding: 0.77rem 1rem;
  border-radius: 0.6em;
  text-decoration: none;
  ${ExtendedTitle} + & {
    margin-top: 2em;
  }

  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    font-size: 1.0625rem;
  }
`;

interface SingleProjectLandingPageProps
  extends Pick<SingleLandingPage, 'extendedTitle' | 'includeNameInHeader'> {
  project: SingleProject;
  isLoggedIn: boolean;
}

export function SingleProjectLandingPage({
  project,
  extendedTitle,
  includeNameInHeader,
  isLoggedIn,
}: SingleProjectLandingPageProps) {
  const accessType = getProjectAccessType(project);

  const { homeEntityCode, code, dashboardGroupName } = project;

  const urls = {
    [PROJECT_ACCESS_TYPES.PENDING]: '',
    [PROJECT_ACCESS_TYPES.ALLOWED]: `/${code}/${homeEntityCode}${
      dashboardGroupName ? `/${encodeURIComponent(dashboardGroupName)}` : ''
    }`,
    [PROJECT_ACCESS_TYPES.DENIED]: isLoggedIn
      ? `?${URL_SEARCH_PARAMS.PROJECT}=${code}#${MODAL_ROUTES.REQUEST_PROJECT_ACCESS}`
      : `#${MODAL_ROUTES.LOGIN}`,
  };

  const actionTexts = {
    [PROJECT_ACCESS_TYPES.PENDING]: 'Approval in progress',
    [PROJECT_ACCESS_TYPES.ALLOWED]: 'View data',
    [PROJECT_ACCESS_TYPES.DENIED]: isLoggedIn ? 'Request access' : 'Log in to view data',
  };

  return (
    <Wrapper>
      {extendedTitle && (
        <ExtendedTitle variant={includeNameInHeader ? 'h2' : 'h1'}>{extendedTitle}</ExtendedTitle>
      )}
      {/* Only display a link if access type is set, and link is disabled if access has not yet been granted */}
      {accessType && (
        <ActionLink
          color="default"
          variant="contained"
          target={accessType === PROJECT_ACCESS_TYPES.ALLOWED ? '_blank' : '_self'}
          component={Link}
          to={urls[accessType]}
          disabled={accessType === PROJECT_ACCESS_TYPES.PENDING}
        >
          {actionTexts[accessType]}
        </ActionLink>
      )}
    </Wrapper>
  );
}
