/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton } from '../widgets';
import { exportData, openFilteredExportDialog } from './actions';

const ExportButtonComponent = ({ onClick }) => {
  return <IconButton icon="download" onClick={onClick} />;
};

ExportButtonComponent.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export const ExportButton = connect(null, (dispatch, { row, actionConfig }) => ({
  onClick: () => dispatch(exportData(actionConfig, row)),
}))(ExportButtonComponent);

export const FilteredExportButton = connect(null, (dispatch, { row }) => ({
  onClick: () => dispatch(openFilteredExportDialog(row)),
}))(ExportButtonComponent);
