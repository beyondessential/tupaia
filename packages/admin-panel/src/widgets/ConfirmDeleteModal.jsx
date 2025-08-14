import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Modal, ModalCenteredContent } from '@tupaia/ui-components';

const Heading = styled(Typography).attrs({
  variant: 'h3',
})`
  margin-bottom: 0.8rem;
  font-size: ${props => props.theme.typography.body2.fontSize};
  font-weight: ${props => props.theme.typography.fontWeightMedium};
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
      <ModalCenteredContent>
        {heading && <Heading>{heading}</Heading>}
        <Typography>{description}</Typography>
      </ModalCenteredContent>
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
