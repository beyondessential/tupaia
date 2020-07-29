/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { LightOutlinedButton, SaveAlt } from '@tupaia/ui-components';
import { openImportDialog } from './actions';

export const ImportButtonComponent = ({ dispatch, label, Button }) => (
  <Button startIcon={<SaveAlt />} onClick={() => dispatch(openImportDialog())}>
    {label}
  </Button>
);

ImportButtonComponent.propTypes = {
  dispatch: PropTypes.func.isRequired,
  label: PropTypes.string,
  Button: PropTypes.element,
};

ImportButtonComponent.defaultProps = {
  label: 'Import',
  Button: LightOutlinedButton,
};

export const ImportButton = connect()(ImportButtonComponent);
