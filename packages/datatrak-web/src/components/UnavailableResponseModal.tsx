import React from 'react';
import { InfoMessageModal } from './InfoMessageModal';

interface UnavailableResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnavailableResponseModal = ({ isOpen, onClose }: UnavailableResponseModalProps) => (
  <InfoMessageModal
    isOpen={isOpen}
    onClose={onClose}
    heading="Unavailable to view submission"
    message="This submission was completed on a different device and therefore cannot be viewed. Please log into DataTrak on a web browser in order to view the submission."
  />
);
