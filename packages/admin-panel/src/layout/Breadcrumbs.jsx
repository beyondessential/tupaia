/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { get } from '../VizBuilderApp/api';

const Wrapper = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
`;

const Breadcrumb = styled.li``;

const BreadcrumbContent = styled(Typography).attrs({
  variant: 'body2',
})`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.palette.text.primary};
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
  if (!itemDetails) return null;

  return (
    <Wrapper>
      <Breadcrumb to={parent?.to || '/'}>
        <BreadcrumbContent component={Link} to={parent?.to || '/'}>
          {parent?.title}
        </BreadcrumbContent>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbContent>{title}</BreadcrumbContent>
      </Breadcrumb>
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
