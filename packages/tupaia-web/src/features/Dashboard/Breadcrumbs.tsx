import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Breadcrumbs as MuiBreadcrumbs } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { MOBILE_BREAKPOINT } from '../../constants';
import { useEntityAncestors, useProject } from '../../api/queries';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.3125rem 0 2.5rem 0.625rem;
  z-index: 1;
  font-size: 0.8rem;
  line-height: 1.2rem;
  background: linear-gradient(rgb(43, 45, 56) 0%, rgba(43, 45, 56, 0) 94.27%);
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
    .filter(
      ({ type }) => (project?.names.length && project?.names.length > 1) || type !== 'project',
    )
    .reverse();

  if (breadcrumbs.length < 2) {
    return null;
  }

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />}>
      {breadcrumbs.map(({ code, name }, index: number) => {
        const isLast = index === breadcrumbs.length - 1;
        return isLast ? (
          <ActiveCrumb key={code}>{name}</ActiveCrumb>
        ) : (
          <Crumb key={code} to={{ ...location, pathname: `/${projectCode}/${code}` }}>
            {name}
          </Crumb>
        );
      })}
    </StyledBreadcrumbs>
  );
};
