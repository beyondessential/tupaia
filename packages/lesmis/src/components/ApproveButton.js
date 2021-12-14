/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import { IconButton, DataChangeAction } from '@tupaia/admin-panel/lib';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiSnackbar from '@material-ui/core/Snackbar';
import { SmallAlert } from '@tupaia/ui-components';
import { useApproveSurveyResponseStatus } from '../api';
import { GREEN } from '../constants';

const Button = styled(IconButton)`
  width: 56px;

  &:hover {
    background: ${GREEN};
  }
`;

export const ApproveButton = ({ value: id }) => {
  const [showAlert, setShowAlert] = useState(false);
  const { mutate, isLoading, isError } = useApproveSurveyResponseStatus();

  const handleClose = () => {
    setShowAlert(false);
  };

  const handleClickApprove = ({ onEditBegin, onEditSuccess, onEditError }) => {
    onEditBegin();
    mutate(id, {
      onSuccess: () => {
        onEditSuccess();
      },
      onError: errorMessage => {
        onEditError(errorMessage.message);
        setShowAlert(true);
      },
    });
  };

  return (
    <>
      <DataChangeAction
        render={props => (
          <Button onClick={() => handleClickApprove(props)}>
            {isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
          </Button>
        )}
      />
      <MuiSnackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <>
          {isError && (
            <SmallAlert onClose={handleClose} severity="error">
              Error. Please click refresh and try again.
            </SmallAlert>
          )}
        </>
      </MuiSnackbar>
    </>
  );
};

ApproveButton.propTypes = {
  value: PropTypes.string.isRequired,
};
