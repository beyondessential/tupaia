/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import { useParams } from 'react-router-dom';

import {
  useExportDashboardVisualisation,
  useExportMapOverlayVisualisation,
} from '../api/mutations';
import { useVisualisation, useVizConfigError } from '../context';
import { DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM } from '../constants';

export const ExportButton = () => {
  const { visualisation } = useVisualisation();

  const { dashboardItemOrMapOverlay } = useParams();

  const useExportViz = () => {
    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM) {
      return useExportDashboardVisualisation(visualisation);
    }
    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.MAP_OVERLAY) {
      return useExportMapOverlayVisualisation(visualisation);
    }
    throw new Error('Unknown viz type');
  };

  const { hasError: vizConfigHasError } = useVizConfigError();
  const { mutateAsync: exportVisualisation } = useExportViz();

  return (
    <IconButton disabled={vizConfigHasError} onClick={exportVisualisation}>
      <GetAppIcon />
    </IconButton>
  );
};
