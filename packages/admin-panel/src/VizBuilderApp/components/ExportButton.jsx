import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import { useParams } from 'react-router-dom';

import {
  useExportDashboardVisualisation,
  useExportMapOverlayVisualisation,
} from '../api/mutations';
import { useVisualisationContext, useVizConfigErrorContext } from '../context';
import { DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM } from '../constants';

export const ExportButton = () => {
  const { visualisation } = useVisualisationContext();

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

  const { hasError: vizConfigHasError } = useVizConfigErrorContext();
  const { mutateAsync: exportVisualisation } = useExportViz();

  return (
    <IconButton disabled={vizConfigHasError} onClick={exportVisualisation}>
      <GetAppIcon />
    </IconButton>
  );
};
