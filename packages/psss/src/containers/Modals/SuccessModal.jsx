import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import CheckCircle from '@material-ui/icons/CheckCircle';

import {
  OutlinedButton,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from '@tupaia/ui-components';

const SuccessText = styled(Typography)`
  font-size: 1rem;
  margin-top: 1rem;
`;

const TickIcon = styled(CheckCircle)`
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

export const SuccessModal = ({ isOpen, onClose, title, mainText, description }) => (
  <Dialog onClose={onClose} open={isOpen}>
    <DialogHeader onClose={onClose} title={title} />
    <DialogContent>
      <TickIcon />
      <Typography variant="h6" gutterBottom>
        {mainText}
      </Typography>
      {description && <SuccessText>{description}</SuccessText>}
    </DialogContent>
    <DialogFooter>
      <OutlinedButton onClick={onClose}>Close</OutlinedButton>
    </DialogFooter>
  </Dialog>
);

SuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mainText: PropTypes.string.isRequired,
  description: PropTypes.string,
};

SuccessModal.defaultProps = {
  description: null,
};
