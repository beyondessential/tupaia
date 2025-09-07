import { Breadcrumbs as MuiBreadcrumbs } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useEntityAncestors, useProject } from '../../api/queries';
import { MOBILE_BREAKPOINT } from '../../constants';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  background-image: linear-gradient(rgb(43, 45, 56) 0%, transparent 94.27%);
  background-image: linear-gradient(in oklab, oklch(30% 0.0201 277) 0%, transparent 94.27%);
  font-size: 0.8rem;
  inset-block-start: 0;
  inset-inline-end: 0;
  inset-inline-start: 0;
  line-height: 1.5;
  padding-block: 0.3125rem 2.5rem;
  padding-inline: 0.625rem 0;
  position: absolute;
  z-index: 1;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }

  .MuiBreadcrumbs-separator {
    margin-inline: 0.2rem 0.3rem;

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
