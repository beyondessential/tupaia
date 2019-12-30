/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { openEditModal } from './actions';

export const CreateButtonComponent = ({ dispatch, label, actionConfig, size }) => (
  <Button onClick={() => dispatch(openEditModal(actionConfig))} size={size}>
    {label}
  </Button>
);

CreateButtonComponent.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  label: PropTypes.string,
  size: PropTypes.string,
};

CreateButtonComponent.defaultProps = {
  label: 'New',
  size: 'lg',
};

export const CreateButton = connect()(CreateButtonComponent);
