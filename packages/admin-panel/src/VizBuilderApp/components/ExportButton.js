/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';

import { useExportVisualisation } from '../api/mutations';
import { useVizBuilderConfig, useVizConfigError } from '../context';

export const ExportButton = () => {
  const [{ visualisation }] = useVizBuilderConfig();
  const { hasError: vizConfigHasError } = useVizConfigError();
  const { mutateAsync: exportVisualisation } = useExportVisualisation(visualisation);

  return (
    <IconButton disabled={vizConfigHasError} onClick={exportVisualisation}>
      <GetAppIcon />
    </IconButton>
  );
};
