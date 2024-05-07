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

export const ConfirmDeleteModal = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
  description,
  heading,
  confirmButtonText,
  cancelButtonText,
}) => {
  const buttons = [
    {
      text: cancelButtonText,
      onClick: onCancel,
      variant: 'outlined',
    },
    {
      text: confirmButtonText,
      onClick: onConfirm,
    },
  ];
  return (
    <Modal onClose={onCancel} isOpen={isOpen} title={title} buttons={buttons}>
      <Container>
        {heading && <Heading variant="h3">{heading}</Heading>}
        <Typography>{description}</Typography>
      </Container>
    </Modal>
  );
};

ConfirmDeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmButtonText: PropTypes.string.isRequired,
  cancelButtonText: PropTypes.string,
  heading: PropTypes.string,
};

ConfirmDeleteModal.defaultProps = {
  onConfirm: () => {},
  onCancel: () => {},
  cancelButtonText: 'Cancel',
  heading: '',
};
