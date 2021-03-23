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
import { useCountryHeirarchyData } from '../api';
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
    <MuiLink>Loading</MuiLink>
  </Skeleton>
);

const getSegments = (orgUnits, orgUnitCode, hierarchy = []) => {
  const orgUnit = orgUnits.find(entity => entity.organisationUnitCode === orgUnitCode);

  if (!orgUnit) {
    return [];
  }

  const newHierarchy = [orgUnit, ...hierarchy];

  if (orgUnit.type === 'Country') {
    return newHierarchy;
  }
  return getSegments(orgUnits, orgUnit.parent, newHierarchy);
};

const useBreadcrumbs = () => {
  const { organisationUnitCode } = useUrlParams();
  // Todo: update data fetch to use entity server country hierarcy endpoint
  const orgUnitResponse = useCountryHeirarchyData();

  if (!orgUnitResponse.data) {
    return { ...orgUnitResponse, breadcrumbs: [] };
  }

  const { countryHierarchy } = orgUnitResponse.data;
  const breadcrumbs = getSegments(countryHierarchy, organisationUnitCode);

  return { ...orgUnitResponse, breadcrumbs };
};

export const Breadcrumbs = () => {
  const { breadcrumbs, isLoading } = useBreadcrumbs();

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />}>
      <Link to="/">Home</Link>
      {isLoading ? (
        <Loader />
      ) : (
        breadcrumbs.map(({ name, organisationUnitCode }, index) => {
          const last = index === breadcrumbs.length - 1;
          return last ? (
            <ActiveSegment key={organisationUnitCode}>{name}</ActiveSegment>
          ) : (
            <Link to={`/${organisationUnitCode}`} key={organisationUnitCode}>
              {name}
            </Link>
          );
        })
      )}
    </StyledBreadcrumbs>
  );
};
