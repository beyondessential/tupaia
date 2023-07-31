/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Breadcrumbs as MuiBreadcrumbs } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { MOBILE_BREAKPOINT } from '../../constants';
import { useEntityAncestors, useProject } from '../../api/queries';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  position: absolute;
  top: 0.3125rem;
  left: 0.625rem;
  z-index: 1;
  font-size: 0.8rem;
  line-height: 1.2rem;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }

  .MuiBreadcrumbs-separator {
    margin-left: 0.2rem;
    margin-right: 0.3rem;

    svg {
      font-size: 0.8rem;
    }
  }
`;

const ActiveCrumb = styled.span`
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Crumb = styled(Link)`
  cursor: pointer;
  color: ${({ theme }) => theme.palette.text.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const Breadcrumbs = () => {
  const location = useLocation();
  const { projectCode, entityCode } = useParams();
  const { data: project } = useProject(projectCode);
  const { data = [] } = useEntityAncestors(projectCode, entityCode);

  const breadcrumbs = data
    // Remove the project from the breadcrumbs if there are multiple projects in the entity hierarchy
    .filter(({ type }: { type: string }) => project?.names.length > 1 || type !== 'project')
    .reverse();

  if (breadcrumbs.length < 2) {
    return null;
  }

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />}>
      {breadcrumbs.map(
        ({ code: entityCode, name: entityName }: { code: string; name: string }, index: number) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <ActiveCrumb key={entityCode}>{entityName}</ActiveCrumb>
          ) : (
            <Crumb key={entityCode} to={{ ...location, pathname: `/${projectCode}/${entityCode}` }}>
              {entityName}
            </Crumb>
          );
        },
      )}
    </StyledBreadcrumbs>
  );
};
