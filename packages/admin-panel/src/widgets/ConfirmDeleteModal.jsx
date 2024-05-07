/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Modal } from './Modal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`;

const Heading = styled(Typography)`
  margin-bottom: 0.8rem;
  font-size: ${props => props.theme.typography.body2.fontSize};
  font-weight: normal;
  color: ${props => props.theme.palette.error.main};
`;

export const ConfirmDeleteModal = ({ isOpen, recordType, onConfirm, onCancel }) => {
  const buttons = [
    {
      text: 'Cancel',
      onClick: onCancel,
      variant: 'outlined',
    },
    {
      text: `Delete ${recordType}`,
      onClick: onConfirm,
    },
  ];
  return (
    <Modal onClose={onCancel} isOpen={isOpen} title={`Delete ${recordType}`} buttons={buttons}>
      <Container>
        <Heading variant="h3">You are about to delete this {recordType}</Heading>
        <Typography>
          Are you sure you would like to delete this {recordType}? This cannot be undone.
        </Typography>
      </Container>
    </Modal>
  );
};

ConfirmDeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  recordType: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
};

ConfirmDeleteModal.defaultProps = {
  onConfirm: () => {},
  onCancel: () => {},
  recordType: 'record',
};
