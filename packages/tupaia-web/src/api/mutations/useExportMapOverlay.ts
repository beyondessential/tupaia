import { useMutation } from '@tanstack/react-query';
import { LatLng } from 'leaflet';
import { MapOverlay } from '@tupaia/types';
import { LegendProps } from '@tupaia/ui-map-components';
import { EntityCode, ProjectCode } from '../../types';
import { API_URL, post } from '../api';
import { downloadPDF } from '../../utils';

type ExportDashboardBody = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  mapOverlayCode?: MapOverlay['code'];
  zoom: number;
  center: LatLng;
  hiddenValues: LegendProps['hiddenValues'];
  tileset: string;
  mapOverlayPeriod?: string;
};

// Requests a map overlay PDF export from the server, and returns the response
export const useExportMapOverlay = (fileName: string) => {
  return useMutation<any, Error, ExportDashboardBody, unknown>(
    ({
      projectCode,
      entityCode,
      mapOverlayCode,
      zoom,
      center,
      hiddenValues,
      tileset,
      mapOverlayPeriod,
    }: ExportDashboardBody) => {
      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(API_URL).hostname;

      return post(`mapOverlays/${projectCode}/${entityCode}/${mapOverlayCode}/export`, {
        responseType: 'blob',
        data: {
          cookieDomain,
          baseUrl: window.location.origin,
          zoom,
          center: JSON.stringify(center),
          hiddenValues: JSON.stringify(hiddenValues),
          tileset,
          mapOverlayPeriod,
          locale: window.navigator?.language || 'en-AU',
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
