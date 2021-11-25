/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { download } from '../api';

export const useExportMapOverlayVisualisation = config =>
  useMutation(['export/mapOverlayVisualisation', config], () =>
    download(
      'export/mapOverlayVisualisation',
      {
        data: { visualisation: config },
      },
      `${config.code || 'New Map Overlay Visualisation'}.json`,
    ),
  );
