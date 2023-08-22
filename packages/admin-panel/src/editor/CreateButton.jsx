/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { LightOutlinedButton } from '@tupaia/ui-components';
import { openEditModal } from './actions';

export const CreateButtonComponent = ({ dispatch, label, actionConfig }) => (
  <LightOutlinedButton
    id="page-new-button"
    startIcon={<AddCircleIcon />}
    onClick={() => dispatch(openEditModal(actionConfig))}
  >
    {label}
  </LightOutlinedButton>
);

CreateButtonComponent.propTypes = {
  actionConfig: PropTypes.PropTypes.shape({
    editEndpoint: PropTypes.string,
    fields: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  label: PropTypes.string,
};

CreateButtonComponent.defaultProps = {
  label: 'New',
};

export const CreateButton = connect()(CreateButtonComponent);
