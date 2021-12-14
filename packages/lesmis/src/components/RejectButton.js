/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ConfirmModal } from '@tupaia/ui-components';
import { IconButton } from '@tupaia/admin-panel/lib';
import { Delete, Clear } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlexCenter } from './Layout';
import { useRejectSurveyResponseStatus } from '../api';
import { RED } from '../constants';

export const RejectButton = ({ value: id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const { mutate, isLoading, isError, error } = useRejectSurveyResponseStatus();

  const handleClickReject = () => {
    mutate(id, {
      onSuccess: () => {
        setIsRejected(true);
        setIsOpen(false);
      },
    });
  };

  return (
    <>
      {isRejected ? (
        <FlexCenter>
          <Clear style={{ color: RED }} />
        </FlexCenter>
      ) : (
        <IconButton onClick={() => setIsOpen(true)}>
          {isLoading ? <CircularProgress size={16} color="inherit" /> : <Delete />}
        </IconButton>
      )}
      <ConfirmModal
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        handleAction={handleClickReject}
        isLoading={isLoading}
        error={isError && error}
        title="Reject Survey Response"
        mainText="Are you sure you want to reject this Survey Response?"
        description="Rejecting a Survey Response will remove the record from this tab and prevent the data displaying in any visualisations."
        actionText="Yes, Reject"
        loadingText="Saving"
      />
    </>
  );
};

RejectButton.propTypes = {
  value: PropTypes.string.isRequired,
};
