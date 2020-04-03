/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton } from '../widgets';
import { openFilteredExportDialog } from './actions';

export const FilteredExportButtonComponent = ({ dispatch, value: recordId, row, actionConfig }) => {
  console.log('FilteredExportButton');
  console.log('PROPS', {
    dispatch,
    value: recordId,
    row,
    actionConfig,
  });

  return (
    <IconButton
      icon="download"
      onClick={() => dispatch(openFilteredExportDialog(actionConfig, recordId, row))}
    />
  );
};

FilteredExportButtonComponent.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
};

export const FilteredExportButton = connect()(FilteredExportButtonComponent);
