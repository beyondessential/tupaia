import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from '@tupaia/ui-components';
import { QrCodeContainer } from './QrCodeContainer';
import { closeQrCodeModal } from './actions';

export const QrCodeModalComponent = ({ isOpen, onDismiss, qrCodeContents, humanReadableId }) => {
  return (
    <Modal onClose={onDismiss} isOpen={isOpen} disableBackdropClick title="Share QR code">
      {qrCodeContents && humanReadableId && (
        <QrCodeContainer qrCodeContents={qrCodeContents} humanReadableId={humanReadableId} />
      )}
    </Modal>
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
