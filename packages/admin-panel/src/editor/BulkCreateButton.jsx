import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openBulkEditModal } from './actions';
import { CreateActionButton } from './ActionButton';

export const BulkCreateButtonComponent = ({ dispatch, label, actionConfig }) => (
  <CreateActionButton
    id="page-button-bulk-create"
    onClick={() => dispatch(openBulkEditModal(actionConfig))}
  >
    {label}
  </CreateActionButton>
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
