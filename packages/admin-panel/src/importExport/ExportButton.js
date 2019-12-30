/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton } from '../widgets';
import { exportData } from '.';

export const ExportButtonComponent = ({ dispatch, value, row, actionConfig }) => (
  <IconButton icon={'download'} onClick={() => dispatch(exportData(actionConfig, value, row))} />
);

ExportButtonComponent.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
};

export const ExportButton = connect()(ExportButtonComponent);
