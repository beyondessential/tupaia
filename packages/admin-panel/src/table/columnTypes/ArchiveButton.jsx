/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { requestDeleteRecord } from '../actions';
import { ColumnActionButton } from './ColumnActionButton';
import { ArchiveIcon } from '../../icons';

const ArchiveButtonComponent = ({ dispatch, actionConfig, reduxId, row }) => {
  const { title = 'Archive' } = actionConfig;
  return (
    <ColumnActionButton
      title={title}
      onClick={() =>
        dispatch(
          requestDeleteRecord(
            reduxId,
            actionConfig.endpoint,
            row.original.id,
            actionConfig.confirmMessage,
          ),
        )
      }
    >
      <ArchiveIcon />
    </ColumnActionButton>
  );
};

ArchiveButtonComponent.propTypes = {
  actionConfig: PropTypes.PropTypes.shape({
    endpoint: PropTypes.string,
    confirmMessage: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  reduxId: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
};

export const ArchiveButton = connect()(ArchiveButtonComponent);
