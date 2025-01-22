import React from 'react';
import PropTypes from 'prop-types';
import { ListItem } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { useUrlParams } from '../utils';

export const LocaleListItemLink = ({ to, ...props }) => {
  const { locale } = useUrlParams();
  return <ListItem button component={RouterLink} to={`/${locale}${to}`} {...props} />;
};

LocaleListItemLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export const LocaleLink = ({ to, ...props }) => {
  const { locale } = useUrlParams();
  return <MuiLink color="inherit" component={RouterLink} to={`/${locale}${to}`} {...props} />;
};

LocaleLink.propTypes = {
  to: PropTypes.string.isRequired,
};
