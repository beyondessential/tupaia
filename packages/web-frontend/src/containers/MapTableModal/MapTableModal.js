/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AssignmentIcon from '@material-ui/icons/Assignment';
import DownloadIcon from '@material-ui/icons/GetApp';
import {
  Dialog,
  DialogHeader,
  DialogContent,
  MapTable,
  useMapDataExport,
} from '@tupaia/ui-components';

import MuiIconButton from '@material-ui/core/IconButton';
import {
  selectCurrentMapOverlayCodes,
  selectCurrentMapOverlays,
  selectMeasureOptions,
  selectOrgUnitCountry,
  selectRenderedMeasuresWithDisplayInfo,
} from '../../selectors';
import { Tooltip } from '../../components/Tooltip';
import { useOverlayDates } from '../MapOverlayBar/useOverlayDates';

const IconButton = styled(MuiIconButton)`
  margin-right: -10px;
  padding: 10px 10px 10px 12px;
`;

const MapTableModalComponent = ({
  currentCountry,
  currentMapOverlays,
  measureOptions,
  measureData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMapOverlaySelected = currentMapOverlays.length > 0;
  const title = isMapOverlaySelected
    ? `${currentMapOverlays.map(({ name }) => name).join(', ')}, ${currentCountry?.name}`
    : '';

  let startDate = null;
  let endDate = null;
  if (currentMapOverlays.length === 1) {
    const mapOverlayDates = useOverlayDates(currentMapOverlays[0]);
    startDate = mapOverlayDates.startDate;
    endDate = mapOverlayDates.endDate;
  }

  const { doExport } = useMapDataExport(measureOptions, measureData, title, startDate, endDate);

  if (!currentMapOverlays || !measureData || !measureOptions || measureData.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <DialogHeader onClose={() => setIsOpen(false)} title={title}>
          {isMapOverlaySelected && (
            <MuiIconButton onClick={doExport}>
              <DownloadIcon />
            </MuiIconButton>
          )}
        </DialogHeader>
        <DialogContent>
          {isMapOverlaySelected ? (
            <MapTable serieses={measureOptions} measureData={measureData} />
          ) : (
            'No map overlay has been selected'
          )}
        </DialogContent>
      </Dialog>
      <Tooltip arrow interactive placement="top" title="Generate Report">
        <IconButton onClick={() => setIsOpen(true)}>
          <AssignmentIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

MapTableModalComponent.propTypes = {
  measureOptions: PropTypes.arrayOf(PropTypes.object),
  measureData: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
    }),
  ),
  currentCountry: PropTypes.object,
  currentMapOverlays: PropTypes.arrayOf(PropTypes.object),
};

MapTableModalComponent.defaultProps = {
  measureOptions: null,
  measureData: null,
  currentCountry: null,
  currentMapOverlays: [],
};

const mapStateToProps = state => {
  const currentMapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const currentMapOverlays = selectCurrentMapOverlays(state);
  const measureOptions = selectMeasureOptions(state, currentMapOverlayCodes) || [];
  const measureData = selectRenderedMeasuresWithDisplayInfo(state, currentMapOverlayCodes);
  const currentCountry = selectOrgUnitCountry(state, state.map.currentCountry);

  return {
    currentMapOverlays,
    measureOptions,
    measureData,
    currentCountry,
  };
};

export const MapTableModal = connect(mapStateToProps)(MapTableModalComponent);
