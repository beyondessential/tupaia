/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { Icon } from '.';

export const IconButton = ({ icon, children, ...buttonProps }) => {
  return (
    <div style={localStyles.container}>
      <Button {...buttonProps}>
        <Icon name={icon} />
        {children}
      </Button>
    </div>
  );
};

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  children: PropTypes.array,
};

IconButton.defaultProps = {
  children: [],
};

const localStyles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
};
