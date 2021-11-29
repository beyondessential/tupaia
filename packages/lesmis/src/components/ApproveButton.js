/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import { IconButton } from '@tupaia/admin-panel/lib';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiSnackbar from '@material-ui/core/Snackbar';
import { SmallAlert } from '@tupaia/ui-components';
import { useApproveSurveyResponseStatus } from '../api';
import { FlexCenter } from './Layout';
import { GREEN } from '../constants';

const Button = styled(IconButton)`
  width: 56px;

  &:hover {
    background: ${GREEN};
  }
`;

export const ApproveButton = ({ value: id }) => {
  const [isApproved, setIsApproved] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { mutate, isLoading, isError, isSuccess } = useApproveSurveyResponseStatus();

  const handleClose = () => {
    setShowAlert(false);
  };

  const handleClickAccept = async () => {
    mutate(id, {
      onSuccess: () => {
        setShowAlert(true);
        setIsApproved(true);
      },
      onError: () => {
        setShowAlert(true);
      },
    });
  };

  return (
    <>
      {isApproved ? (
        <FlexCenter>
          <CheckIcon style={{ color: GREEN }} />
        </FlexCenter>
      ) : (
        <Button onClick={handleClickAccept}>
          {isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
        </Button>
      )}
      <MuiSnackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <>
          {isSuccess && (
            <SmallAlert onClose={handleClose} severity="success">
              Success
            </SmallAlert>
          )}
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
