/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dialog, DialogHeader } from '@tupaia/ui-components';
import { QrCodeContainer } from './QrCodeContainer';
import { closeQrCodeModal } from './actions';
import { ModalContentProvider } from '../widgets';

export const QrCodeModalComponent = ({ isOpen, onDismiss, qrCodeContents, humanReadableId }) => {
  return (
    <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick>
      <DialogHeader onClose={onDismiss} title="Share QR Code" />
      <ModalContentProvider isLoading={false}>
        {qrCodeContents && humanReadableId && (
          <QrCodeContainer qrCodeContents={qrCodeContents} humanReadableId={humanReadableId} />
        )}
      </ModalContentProvider>
    </Dialog>
  );
};

QrCodeModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  qrCodeContents: PropTypes.string,
  humanReadableId: PropTypes.string,
};

QrCodeModalComponent.defaultProps = {
  qrCodeContents: null,
  humanReadableId: null,
};

const mapStateToProps = state => ({
  ...state.qrCode,
});

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(closeQrCodeModal()),
  dispatch,
});

const mergeProps = ({ ...stateProps }, { dispatch, ...dispatchProps }, { ...ownProps }) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  };
};

export const QrCodeModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(QrCodeModalComponent);
