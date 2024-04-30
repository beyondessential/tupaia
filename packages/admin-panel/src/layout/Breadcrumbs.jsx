/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import { ArrowBack } from '@material-ui/icons';
import { Typography, Breadcrumbs as MuiBreadcrumbs, IconButton } from '@material-ui/core';
import styled from 'styled-components';
import { get } from '../VizBuilderApp/api';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.primary};
  margin-right: 0.5rem;
`;

const ActiveBreadcrumb = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const useItemDetails = (id, parent) => {
  return useQuery(
    ['itemDetails', parent?.endpoint, id],
    async () => {
      return get(parent?.endpoint, {
        params: {
          filter: JSON.stringify({ id }),
        },
      });
    },
    {
      enabled: !!id && !!parent?.endpoint,
      select: data => data?.[0] ?? null,
    },
  );
};

export const Breadcrumbs = ({ parent, displayValue, title }) => {
  const params = useParams();
  const { id } = params;
  const { data: itemDetails } = useItemDetails(id, parent);
  if (!parent || !id) return null;

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
        {itemDetails && <Typography>{itemDetails[displayValue]}</Typography>}
      </MuiBreadcrumbs>
    </Wrapper>
  );
};

Breadcrumbs.propTypes = {
  parent: PropTypes.object,
  displayValue: PropTypes.string,
  title: PropTypes.string,
};

Breadcrumbs.defaultProps = {
  parent: null,
  displayValue: 'id',
  title: '',
};
