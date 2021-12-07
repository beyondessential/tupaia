/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { LightOutlinedButton } from '@tupaia/ui-components';
import { openBulkEditModal } from './actions';

export const BulkCreateButtonComponent = ({ dispatch, label, actionConfig }) => (
  <LightOutlinedButton
    startIcon={<AddCircleIcon />}
    onClick={() => dispatch(openBulkEditModal(actionConfig))}
  >
    Bulk {label}
  </LightOutlinedButton>
);

BulkCreateButtonComponent.propTypes = {
  actionConfig: PropTypes.PropTypes.shape({
    bulkGetEndpoint: PropTypes.string,
    bulkUpdateEndpoint: PropTypes.string,
    fields: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  label: PropTypes.string,
};

BulkCreateButtonComponent.defaultProps = {
  label: 'New',
};

export const BulkCreateButton = connect()(BulkCreateButtonComponent);
