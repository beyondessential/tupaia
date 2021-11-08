/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';

import {
  useExportDashboardVisualisation,
  useExportMapOverlayVisualisation,
} from '../api/mutations';
import { useVizConfig, useVizConfigError } from '../context';
import { useParams } from 'react-router-dom';
import { VIZ_TYPE_PARAM } from '../constants';

export const ExportButton = () => {
  const [{ visualisation }] = useVizConfig();

  const { vizType } = useParams();

  const useExportViz = () => {
    if (vizType === VIZ_TYPE_PARAM.DASHBOARD_ITEM) {
      return useExportDashboardVisualisation(visualisation);
    }
    if (vizType === VIZ_TYPE_PARAM.MAP_OVERLAY) {
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
