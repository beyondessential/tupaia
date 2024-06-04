/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { LatLngBounds } from 'leaflet';
import { MapOverlay } from '@tupaia/types';
import { LegendProps } from '@tupaia/ui-map-components';
import { EntityCode, ProjectCode } from '../../types';
import { API_URL, post } from '../api';
import { downloadPDF } from '../../utils';

type ExportDashboardBody = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  mapOverlayCode?: MapOverlay['code'];
  bounds: LatLngBounds;
  hiddenValues: LegendProps['hiddenValues'];
};

// Requests a map overlay PDF export from the server, and returns the response
export const useExportMapOverlay = (fileName: string) => {
  return useMutation<any, Error, ExportDashboardBody, unknown>(
    ({ projectCode, entityCode, mapOverlayCode, bounds, hiddenValues }: ExportDashboardBody) => {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;

      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(API_URL).hostname;

      return post(`mapOverlays/${projectCode}/${entityCode}/${mapOverlayCode}/export`, {
        responseType: 'blob',
        data: {
          cookieDomain,
          baseUrl,
          bounds: JSON.stringify(bounds),
          hiddenValues: JSON.stringify(hiddenValues),
        },
      });
    },
    {
      onSuccess: data => {
        downloadPDF(data, fileName);
      },
    },
  );
};
