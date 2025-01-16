import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowBack } from '@material-ui/icons';
import { Breadcrumbs as MuiBreadcrumbs, IconButton, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { generateTitle } from '../pages/resources/resourceName';
import { useLinkToPreviousSearchState } from '../utilities';

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

  const pathname = parent?.to || '/';

  const { to, newState } = useLinkToPreviousSearchState(pathname);

  return (
    <Wrapper>
      <BackButton component={Link} to={to} onClick={onClickLinks} state={newState}>
        <ArrowBack />
      </BackButton>
      <MuiBreadcrumbs separator="|">
        <Breadcrumb
          component={Link}
          to={to}
          onClick={onClickLinks}
          color="textPrimary"
          state={newState}
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
