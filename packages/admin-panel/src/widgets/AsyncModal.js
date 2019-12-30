/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';

/**
 * A modal that can be used to allow asynchronous interactions, and as such gives the ability to
 * display a loading spinner as well as an error message if the async function fails
 */

export class AsyncModal extends React.Component {
  renderHeader() {
    const { isLoading, errorMessage, title } = this.props;
    let titleString = title;
    if (errorMessage) {
      titleString = 'Error';
    } else if (isLoading) {
      titleString = 'Loading';
    }
    return <ModalHeader>{titleString}</ModalHeader>;
  }

  renderConfirmButton() {
    const { errorMessage, isLoading, isConfirmDisabled, confirmLabel, onConfirm } = this.props;
    return (
      <Button onClick={onConfirm} disabled={!!errorMessage || isLoading || isConfirmDisabled}>
        {confirmLabel}
      </Button>
    );
  }

  renderContent() {
    const { isLoading, errorMessage, renderContent } = this.props;
    let temporaryMessage = '';
    if (errorMessage) {
      temporaryMessage = (
        <Alert color={'danger'}>
          <p style={localStyles.errorText}>{errorMessage}</p>
        </Alert>
      );
    } else if (isLoading) {
      temporaryMessage = 'Please be patient, this can take some time...';
    }
    // We render content every time, even if we then make it hidden, so we don't lose edit state
    // after dismissing an error message
    const content = renderContent();
    if (temporaryMessage || content) {
      return (
        <React.Fragment>
          {temporaryMessage}
          <span style={temporaryMessage ? { display: 'none' } : {}}>{content}</span>
        </React.Fragment>
      );
    }
    
    return null;
  }

  renderFooter() {
    const { errorMessage, isLoading, onDismiss, dismissLabel } = this.props;
    if (isLoading && !errorMessage) {
      return null;
    }
    return (
      <ModalFooter>
        {this.renderConfirmButton()}
        <Button onClick={onDismiss} disabled={isLoading}>
          {errorMessage ? 'Dismiss' : dismissLabel}
        </Button>
      </ModalFooter>
    );
  }

  render() {
    const content = this.renderContent();
    return (
      <div className={'static-modal'}>
        <Modal isOpen={!!content}>
          {this.renderHeader()}
          <ModalBody>{content}</ModalBody>
          {this.renderFooter()}
        </Modal>
      </div>
    );
  }
}

AsyncModal.propTypes = {
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isConfirmDisabled: PropTypes.bool,
  confirmLabel: PropTypes.string,
  title: PropTypes.string,
  renderContent: PropTypes.func,
  dismissLabel: PropTypes.string,
};

AsyncModal.defaultProps = {
  errorMessage: null,
  title: null,
  isConfirmDisabled: false,
  confirmLabel: 'Confirm',
  renderContent: () => null,
  dismissLabel: 'Cancel',
};

const localStyles = {
  errorText: {
    whiteSpace: 'pre-wrap',
  },
};
