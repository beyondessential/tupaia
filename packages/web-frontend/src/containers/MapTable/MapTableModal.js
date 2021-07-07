import React, { useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { Dialog, DialogHeader, DialogContent } from '@tupaia/ui-components';
import MuiIconButton from '@material-ui/core/IconButton';
import { MapTable } from './MapTable';
import { selectCurrentMeasure, selectRenderedMeasuresWithDisplayInfo } from '../../selectors';

const IconButton = styled(MuiIconButton)`
  margin: 0 0 0 1rem;
  padding: 10px 8px 10px 12px;
`;

export const MapTableModalComponent = ({ currentMeasure }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <DialogHeader onClose={() => setIsOpen(false)} title={currentMeasure.name} />
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

const mapStateToProps = state => {
  const currentMeasure = selectCurrentMeasure(state);

  return {
    currentMeasure,
  };
};

export const MapTableModal = connect(mapStateToProps)(MapTableModalComponent);
