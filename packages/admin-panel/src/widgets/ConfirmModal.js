/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';

/**
 * A modal that provides a simple confirm or cancel interaction
 */

export const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className={'static-modal'}>
    <Modal isOpen={!!message}>
      <ModalHeader>{'Are you sure?'}</ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button onClick={onConfirm}>{'Confirm'}</Button>
        <Button onClick={onCancel}>{'Cancel'}</Button>
      </ModalFooter>
    </Modal>
  </div>
);

ConfirmModal.propTypes = {
  message: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

ConfirmModal.defaultProps = {
  message: '',
};
