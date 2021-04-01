/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useEntitiesData } from '../api';
import { useUrlParams } from '../utils';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  font-size: 0.75rem;
  line-height: 0.875rem;
  text-transform: capitalize;

  .MuiBreadcrumbs-separator {
    margin-left: 0.2rem;
    margin-right: 0.3rem;

    svg {
      font-size: 0.75rem;
    }
  }
`;

const ActiveSegment = styled.span`
  color: ${props => props.theme.palette.primary.main};
`;

const Link = props => <MuiLink color="inherit" {...props} component={RouterLink} />;

const Loader = () => (
  <Skeleton animation="wave">
    <MuiLink>breadcrumbsLoading</MuiLink>
  </Skeleton>
);

const getHierarchy = (entities, entityCode, hierarchy = []) => {
  const entity = entities.find(entity => entity.code === entityCode);

  if (!entity) {
    return [];
  }

  const newHierarchy = [entity, ...hierarchy];

  if (entity.type === 'country') {
    return newHierarchy;
  }
  return getHierarchy(entities, entity.parentCode, newHierarchy);
};

const useBreadcrumbs = () => {
  const { entityCode } = useUrlParams();
  const { isLoading, data: entities = [] } = useEntitiesData();
  const breadcrumbs = getHierarchy(entities, entityCode);
  return { isLoading, breadcrumbs };
};

export const Breadcrumbs = () => {
  const { breadcrumbs, isLoading } = useBreadcrumbs();

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />}>
      <Link to="/">Home</Link>
      {isLoading ? (
        <Loader />
      ) : (
        breadcrumbs.map(({ name, code }, index) => {
          const last = index === breadcrumbs.length - 1;
          return last ? (
            <ActiveSegment key={code}>{name}</ActiveSegment>
          ) : (
            // Todo: update to use make link
            <Link to={`/${code}`} key={code}>
              {name}
            </Link>
          );
        })
      )}
    </StyledBreadcrumbs>
  );
};
