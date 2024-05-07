/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openEditModal } from './actions';
import { CreateActionButton } from './ActionButton';

export const CreateButtonComponent = ({ dispatch, label, actionConfig }) => (
  <CreateActionButton onClick={() => dispatch(openEditModal(actionConfig))}>
    {label}
  </CreateActionButton>
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
