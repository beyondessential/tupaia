import React, { useState } from 'react';
import styled from 'styled-components';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { Dialog, DialogHeader, DialogContent } from '@tupaia/ui-components';
import MuiIconButton from '@material-ui/core/IconButton';
import { MapTable } from './MapTable';

const IconButton = styled(MuiIconButton)`
  margin: 0 0 0 1rem;
  padding: 10px 8px 10px 12px;
`;

export const MapTableModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <DialogHeader onClose={() => setIsOpen(false)} title="Data" />
        <DialogContent>
          <MapTable />
        </DialogContent>
      </Dialog>
      <IconButton onClick={() => setIsOpen(true)}>
        <AssignmentIcon />
      </IconButton>
    </>
  );
};
