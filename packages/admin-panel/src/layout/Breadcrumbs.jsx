/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { ArrowBack } from '@material-ui/icons';
import { Breadcrumbs as MuiBreadcrumbs, IconButton, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { generateTitle } from '../pages/resources/resourceName';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};
`;

const BackButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.primary};
  margin-right: 0.5rem;
`;

const Breadcrumb = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  &:is(a) {
    &:hover,
    &:focus,
    &:focus-visible {
      color: ${({ theme }) => theme.palette.primary.main};
    }
  }
`;

export const Breadcrumbs = ({
  parent,
  displayProperty,
  title,
  details,
  getDisplayValue,
  onClickLinks,
}) => {
  const itemDisplayValue = getDisplayValue ? getDisplayValue(details) : details?.[displayProperty];

  const parentTitle = parent ? parent.title ?? generateTitle(parent.resourceName) : null;

  const location = useLocation();
  const { state } = location;
  const pathname = parent?.to || '/';

  const to = {
    ...location,
    pathname,
    search: state?.prevSearch?.[pathname] ?? '',
  };

  // reset the search state for the parent page when navigating back so that once the user navigates back to the parent page, the search filter doesn't get reapplied if they navigate to a different page and come back
  const newState = {
    ...state,
    prevSearch: {
      ...state?.prevSearch,
      [pathname]: '',
    },
  };

  return (
    <Wrapper>
      <BackButton component={Link} to={to} onClick={onClickLinks} state={newState}>
        <ArrowBack />
      </BackButton>
      <MuiBreadcrumbs separator="|">
        <Breadcrumb
          component={Link}
          to={parent?.to || '/'}
          onClick={onClickLinks}
          color="textPrimary"
        >
          {parentTitle}
        </Breadcrumb>
        <Breadcrumb color="textSecondary">{title}</Breadcrumb>
        {details && <Typography>{itemDisplayValue}</Typography>}
      </MuiBreadcrumbs>
    </Wrapper>
  );
};

Breadcrumbs.propTypes = {
  parent: PropTypes.object,
  displayProperty: PropTypes.string,
  title: PropTypes.string,
  details: PropTypes.object,
  getDisplayValue: PropTypes.func,
  onClickLinks: PropTypes.func,
};

Breadcrumbs.defaultProps = {
  parent: null,
  displayProperty: 'id',
  title: '',
  details: null,
  getDisplayValue: null,
  onClickLinks: null,
};
