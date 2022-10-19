/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from '@material-ui/lab/Skeleton';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { darkWhite } from '../styles';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  font-size: 0.8rem;
  line-height: 1.2rem;

  .MuiBreadcrumbs-separator {
    margin-left: 0.2rem;
    margin-right: 0.3rem;

    svg {
      font-size: 0.8rem;
    }
  }
`;

const ActiveCrumb = styled.span`
  color: ${darkWhite};
`;

const Loader = () => (
  <Skeleton animation="wave">
    <MuiLink>breadcrumbsLoading</MuiLink>
  </Skeleton>
);

const NonActiveCrumb = styled.span`
  cursor: pointer;
  color: ${darkWhite};
  &:hover {
    text-decoration: underline;
  }
`;

export const Breadcrumbs = ({ isLoading, breadcrumbs, onChangeOrgUnit }) => {
  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon />} aria-label="breadcrumb">
      {isLoading ? (
        <Loader />
      ) : (
        breadcrumbs.map(({ code, name }, index) => {
          const last = index === breadcrumbs.length - 1;
          return last ? (
            <ActiveCrumb key={code}>{name}</ActiveCrumb>
          ) : (
            <NonActiveCrumb key={code} onClick={() => onChangeOrgUnit(code)}>
              {name}
            </NonActiveCrumb>
          );
        })
      )}
    </StyledBreadcrumbs>
  );
};

Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func.isRequired,
};

Breadcrumbs.defaultProps = {
  isLoading: false,
};
