/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../constants';
import Skeleton from '@material-ui/lab/Skeleton';
import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useEntityAncestors } from '../../api/queries';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  position: absolute;
  top: 5px;
  left: 10px;
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
  color: #efefef;
`;

const Crumb = styled(Link)`
  cursor: pointer;
  color: #efefef;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Loader = () => (
  <Skeleton animation="wave">
    <MuiLink>breadcrumbsLoading</MuiLink>
  </Skeleton>
);

export const Breadcrumbs = () => {
  const location = useLocation();
  const { projectCode } = useParams();
  const { isLoading, data } = useEntityAncestors('explore', 'explore');
  const breadcrumbs = data?.map(({ code, name }) => ({ code, name })) || [];

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />}>
      {isLoading ? (
        <Loader />
      ) : (
        breadcrumbs.map(({ code: entityCode, name: entityName }, index) => {
          const last = index === breadcrumbs.length - 1;
          return last ? (
            <ActiveCrumb key={entityCode}>{entityName}</ActiveCrumb>
          ) : (
            <Crumb key={entityCode} to={{ ...location, pathname: `/${projectCode}/${entityCode}` }}>
              {entityName}
            </Crumb>
          );
        })
      )}
    </StyledBreadcrumbs>
  );
};
