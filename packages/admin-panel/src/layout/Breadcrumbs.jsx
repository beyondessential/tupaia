/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
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

const ActiveBreadcrumb = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

export const Breadcrumbs = ({ parent, displayProperty, title, details, getDisplayValue }) => {
  const itemDisplayValue = getDisplayValue ? getDisplayValue(details) : details?.[displayProperty];

  const parentTitle = parent ? parent.title ?? generateTitle(parent.resourceName) : null;

  return (
    <Wrapper>
      <BackButton component={Link} to={parent?.to || '/'}>
        <ArrowBack />
      </BackButton>
      <MuiBreadcrumbs separator="|">
        <ActiveBreadcrumb component={Link} to={parent?.to || '/'}>
          {parentTitle}
        </ActiveBreadcrumb>
        <ActiveBreadcrumb>{title}</ActiveBreadcrumb>
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
};

Breadcrumbs.defaultProps = {
  parent: null,
  displayProperty: 'id',
  title: '',
  details: null,
  getDisplayValue: null,
};
