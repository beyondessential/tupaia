import React from 'react';
import { connect } from 'react-redux';
import { Snackbar, SnackbarContent, IconButton, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import { resendVerificationEmail, openResendEmailSuccess } from '../../actions';

export const EMAIL_VERIFIED_STATUS = {
  UNVERIFIED: 'U',
  VERIFIED: 'Y',
  NEW_USER: 'N',
};

function EmailVerifyNagComponent({
  emailVerified,
  currentUserEmail,
  onResendEmail,
  onCloseToast,
  displayNag,
}) {
  return emailVerified === EMAIL_VERIFIED_STATUS.UNVERIFIED && displayNag ? (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open="true"
        autoHideDuration={2000}
      >
        <SnackbarContent
          contentprops={{
            'aria-describedby': 'message-id',
          }}
          message="Email address not verified - click here to verify your email"
          action={[
            <Button
              key="undo"
              color="secondary"
              size="small"
              onClick={() => onResendEmail(currentUserEmail)}
            >
              Send Now
            </Button>,
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => onCloseToast()}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </Snackbar>
    </div>
  ) : (
    ''
  );
}

EmailVerifyNagComponent.propTypes = {
  emailVerified: PropTypes.string,
  currentUserEmail: PropTypes.string.isRequired,
  onResendEmail: PropTypes.func.isRequired,
  onCloseToast: PropTypes.func.isRequired,
  displayNag: PropTypes.bool.isRequired,
};

EmailVerifyNagComponent.defaultProps = {
  emailVerified: null,
};

const mapStateToProps = state => {
  const { emailVerified, currentUserEmail } = state.authentication;
  const { overlay } = state.global;

  const displayNag = !overlay;

  return {
    emailVerified,
    currentUserEmail,
    displayNag,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onResendEmail: email => dispatch(resendVerificationEmail(email)),
    onCloseToast: () => dispatch(openResendEmailSuccess()),
  };
};

export const EmailVerifyNag = connect(mapStateToProps, mapDispatchToProps)(EmailVerifyNagComponent);
