/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from '@material-ui/lab/Skeleton';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { LocaleLink } from './LocaleLinks';

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

const Loader = () => (
  <Skeleton animation="wave">
    <MuiLink>breadcrumbsLoading</MuiLink>
  </Skeleton>
);

export const Breadcrumbs = ({ isLoading, breadcrumbs }) => (
  <StyledBreadcrumbs separator={<NavigateNextIcon />}>
    <LocaleLink to="/">Home</LocaleLink>
    {isLoading ? (
      <Loader />
    ) : (
      breadcrumbs.map(({ name, url }, index) => {
        const last = index === breadcrumbs.length - 1;
        return last ? (
          <ActiveSegment key={url}>{name}</ActiveSegment>
        ) : (
          <LocaleLink to={url} key={url}>
            {name}
          </LocaleLink>
        );
      })
    )}
  </StyledBreadcrumbs>
);

Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
};

Breadcrumbs.defaultProps = {
  isLoading: false,
};
