/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ConfirmModal } from '@tupaia/ui-components';
import { IconButton, DataChangeAction } from '@tupaia/admin-panel/lib';
import { Delete } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useRejectSurveyResponseStatus } from '../api';

export const RejectButton = ({ value: id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isLoading, isError, error } = useRejectSurveyResponseStatus();

  const handleClickReject = ({ onEditBegin, onEditSuccess, onEditError }) => {
    onEditBegin();

    mutate(id, {
      onSuccess: () => {
        onEditSuccess();
        setIsOpen(false);
      },
      onError: errorMessage => {
        onEditError(errorMessage.message);
        setIsOpen(false);
      },
    });
  };

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)}>
        {isLoading ? <CircularProgress size={16} color="inherit" /> : <Delete />}
      </IconButton>
      <DataChangeAction
        render={props => (
          <ConfirmModal
            onClose={() => setIsOpen(false)}
            isOpen={isOpen}
            handleAction={() => handleClickReject(props)}
            isLoading={isLoading}
            error={isError ? error : null}
            title="Reject Survey Response"
            mainText="Are you sure you want to reject this Survey Response?"
            description="Rejecting a Survey Response will remove the record from this tab and prevent the data displaying in any visualisations."
            actionText="Yes, Reject"
            loadingText="Saving"
          />
        )}
      />
    </>
  );
};

RejectButton.propTypes = {
  value: PropTypes.string.isRequired,
};
