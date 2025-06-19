import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import { ColumnActionButton, DataChangeAction, useApiContext } from '@tupaia/admin-panel';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiSnackbar from '@material-ui/core/Snackbar';
import { SmallAlert } from '@tupaia/ui-components';
import { useApproveSurveyResponseStatus } from '../api';

export const ApproveButton = ({ row }) => {
  const api = useApiContext();
  const [showAlert, setShowAlert] = useState(false);
  const { mutate, isLoading, isError } = useApproveSurveyResponseStatus(api);

  const handleClose = () => {
    setShowAlert(false);
  };

  const handleClickApprove = ({ onEditBegin, onEditSuccess, onEditError }) => {
    onEditBegin();
    mutate(row.original.id, {
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
          <ColumnActionButton onClick={() => handleClickApprove(props)}>
            {isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
          </ColumnActionButton>
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
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
