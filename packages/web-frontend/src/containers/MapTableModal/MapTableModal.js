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
import { Dialog, DialogHeader, DialogContent } from '@tupaia/ui-components';
import { Table, useMapDataExport } from '@tupaia/ui-components/lib/map';
import MuiIconButton from '@material-ui/core/IconButton';
import {
  selectCurrentMapOverlays,
  selectOrgUnitCountry,
  selectRenderedMeasuresWithDisplayInfo,
} from '../../selectors';
import { Tooltip } from '../../components/Tooltip';

const IconButton = styled(MuiIconButton)`
  margin: 0 0 0 1rem;
  padding: 10px 8px 10px 12px;
`;

const MapTableModalComponent = ({
  currentCountry,
  currentMapOverlays,
  measureOptions,
  measureData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const title = `${currentMapOverlays.map(({ name }) => name).join(', ')}, ${currentCountry?.name}`;
  const { doExport } = useMapDataExport(measureOptions, measureData, title);

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <DialogHeader onClose={() => setIsOpen(false)} title={title}>
          <MuiIconButton onClick={doExport}>
            <DownloadIcon />
          </MuiIconButton>
        </DialogHeader>
        <DialogContent>
          <Table serieses={measureOptions} measureData={measureData} />
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
  const { measureOptions } = state.map.measureInfo;
  // TODO: select multiple map overlays for map table modal
  const currentMapOverlays = selectCurrentMapOverlays(state);
  const measureData = selectRenderedMeasuresWithDisplayInfo(state);
  const currentCountry = selectOrgUnitCountry(state, state.map.measureInfo.currentCountry);

  return {
    currentMapOverlays,
    measureOptions,
    measureData,
    currentCountry,
  };
};

export const MapTableModal = connect(mapStateToProps)(MapTableModalComponent);
