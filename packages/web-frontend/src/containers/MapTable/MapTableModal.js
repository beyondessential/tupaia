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

export const MapTableModalComponent = ({
  currentCountry,
  currentMeasure,
  measureOptions,
  measureData,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!currentMeasure || !measureData || !measureOptions || measureData.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <DialogHeader
          onClose={() => setIsOpen(false)}
          title={`${currentMeasure.name}, ${currentCountry}`}
        />
        <DialogContent>
          <MapTable measureOptions={measureOptions} measureData={measureData} />
        </DialogContent>
      </Dialog>
      <IconButton onClick={() => setIsOpen(true)}>
        <AssignmentIcon />
      </IconButton>
    </>
  );
};

const mapStateToProps = state => {
  const { measureOptions, currentCountry } = state.map.measureInfo;
  const currentMeasure = selectCurrentMeasure(state);
  const measureData = selectRenderedMeasuresWithDisplayInfo(state);

  return {
    currentMeasure,
    measureOptions,
    measureData,
    currentCountry,
  };
};

export const MapTableModal = connect(mapStateToProps)(MapTableModalComponent);
