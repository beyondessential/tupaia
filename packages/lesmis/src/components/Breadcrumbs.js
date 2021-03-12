/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useCurrentOrgUnitData } from '../api';

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

const getSegments = (orgUnits, orgUnitCode, hierarchy = []) => {
  const orgUnit = orgUnits.find(entity => entity.organisationUnitCode === orgUnitCode);

  if (!orgUnit) {
    return [];
  }

  const newHierarchy = [...hierarchy, orgUnit];

  if (orgUnit.type === 'Country') {
    return newHierarchy.reverse();
  }
  return getSegments(orgUnits, orgUnit.parent, newHierarchy);
};

const useBreadcrumbs = () => {
  const query = useCurrentOrgUnitData({ includeCountryData: true });

  if (!query.data) {
    return { ...query, segments: [] };
  }

  const { countryHierarchy, organisationUnitCode } = query.data;
  const segments = getSegments(countryHierarchy, organisationUnitCode);

  return { ...query, segments };
};

export const Breadcrumbs = () => {
  const { segments } = useBreadcrumbs();

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />}>
      <Link to="/">Home</Link>
      {segments.map(({ name, organisationUnitCode }, index) => {
        const last = index === segments.length - 1;
        return last ? (
          <ActiveSegment key={organisationUnitCode}>{name}</ActiveSegment>
        ) : (
          <Link to={`/${organisationUnitCode}`} key={organisationUnitCode}>
            {name}
          </Link>
        );
      })}
    </StyledBreadcrumbs>
  );
};
