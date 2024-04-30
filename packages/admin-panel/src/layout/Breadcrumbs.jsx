/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowBack } from '@material-ui/icons';
import { Typography, Breadcrumbs as MuiBreadcrumbs, IconButton } from '@material-ui/core';
import styled from 'styled-components';

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

export const Breadcrumbs = ({ parent, displayValue, title, details }) => {
  return (
    <Wrapper>
      <BackButton component={Link} to={parent?.to || '/'}>
        <ArrowBack />
      </BackButton>
      <MuiBreadcrumbs separator="|">
        <ActiveBreadcrumb component={Link} to={parent?.to || '/'}>
          {parent?.title}
        </ActiveBreadcrumb>
        <ActiveBreadcrumb>{title}</ActiveBreadcrumb>
        {details && <Typography>{details[displayValue]}</Typography>}
      </MuiBreadcrumbs>
    </Wrapper>
  );
};

Breadcrumbs.propTypes = {
  parent: PropTypes.object,
  displayValue: PropTypes.string,
  title: PropTypes.string,
  details: PropTypes.object,
};

Breadcrumbs.defaultProps = {
  parent: null,
  displayValue: 'id',
  title: '',
  details: null,
};
