import MuiLink from '@material-ui/core/Link';
import PropTypes from 'prop-types';
import React from 'react';

export const LinkButton = ({ children, onClick }) => (
  <MuiLink component="button" onClick={onClick} underline="always">
    {children}
  </MuiLink>
);

LinkButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
