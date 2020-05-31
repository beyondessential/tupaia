/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton } from '../widgets';
import { openEditModal } from './actions';

export const EditButtonComponent = ({ dispatch, value: recordId, actionConfig }) => {
  //console.log('EDIT BUTTON', actionConfig);
  return (
    <IconButton
      icon={actionConfig.icon || 'cog'}
      onClick={() => dispatch(openEditModal(actionConfig, recordId))}
    />
  );
};

EditButtonComponent.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export const EditButton = connect()(EditButtonComponent);
