/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import { IconButton } from '../widgets';
import { exportData } from './actions';

const ExportButtonComponent = ({ onClick }) => {
  return (
    <IconButton onClick={onClick}>
      <ImportExportIcon />
    </IconButton>
  );
};

ExportButtonComponent.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export const ExportButton = connect(null, (dispatch, { row, actionConfig }) => ({
  onClick: () => dispatch(exportData(actionConfig, row)),
}))(ExportButtonComponent);
