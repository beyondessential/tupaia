/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton } from '../widgets';
import { openFilteredExportDialog } from './actions';

export const FilteredExportButtonComponent = ({ dispatch, actionConfig, row }) => (
  <IconButton
    icon="download"
    onClick={() => dispatch(openFilteredExportDialog(actionConfig, row))}
  />
);

FilteredExportButtonComponent.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  row: PropTypes.object.isRequired,
};

export const FilteredExportButton = connect()(FilteredExportButtonComponent);
