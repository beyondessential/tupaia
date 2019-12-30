/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { openImportDialog } from './actions';

export const ImportButtonComponent = ({ dispatch, label, actionConfig, size }) => (
  <Button onClick={() => dispatch(openImportDialog(actionConfig))} size={size}>
    {label}
  </Button>
);

ImportButtonComponent.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  label: PropTypes.string,
  size: PropTypes.string,
};

ImportButtonComponent.defaultProps = {
  label: 'Import',
  size: 'lg',
};

export const ImportButton = connect()(ImportButtonComponent);
