import { useMutation } from '@tanstack/react-query';
import downloadJs from 'downloadjs';
import { LatLng } from 'leaflet';
import { MapOverlay } from '@tupaia/types';
import { LegendProps } from '@tupaia/ui-map-components';
import { EntityCode, ProjectCode } from '../../types';
import { API_URL, post } from '../api';
import { downloadPDF } from '../../utils';

interface ExportDashboardBody {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  mapOverlayCode?: MapOverlay['code'];
  zoom: number;
  center: LatLng;
  hiddenValues: LegendProps['hiddenValues'];
  tileset: string;
  mapOverlayPeriod?: string;
}

const buildExportBody = (body: ExportDashboardBody, format: 'pdf' | 'png') => {
  const {
    projectCode,
    entityCode,
    mapOverlayCode,
    zoom,
    center,
    hiddenValues,
    tileset,
    mapOverlayPeriod,
  } = body;

  if (!projectCode || !entityCode || !mapOverlayCode) {
    throw new Error(
      `Cannot export map overlay: missing required params (projectCode, entityCode, mapOverlayCode)`,
    );
  }

  const cookieDomain = new URL(API_URL).hostname;
  return {
    endpoint: `mapOverlays/${projectCode}/${entityCode}/${mapOverlayCode}/export`,
    data: {
      cookieDomain,
      baseUrl: window.location.origin,
      zoom,
      center: JSON.stringify(center),
      hiddenValues: JSON.stringify(hiddenValues),
      tileset,
      mapOverlayPeriod,
      locale: window.navigator?.language || 'en-AU',
      format,
    },
  };
};

// Requests a map overlay PDF export from the server, and returns the response
export const useExportMapOverlay = (fileName: string) => {
  return useMutation<any, Error, ExportDashboardBody, unknown>(
    (body: ExportDashboardBody) => {
      const { endpoint, data } = buildExportBody(body, 'pdf');
      return post(endpoint, { responseType: 'blob', data });
    },
    {
      onSuccess: data => {
        downloadPDF(data, fileName);
      },
    },
  );
};

// Requests a map overlay PNG export from the server, and returns the response
export const useExportMapOverlayImage = (fileName: string) => {
  return useMutation<any, Error, ExportDashboardBody, unknown>(
    (body: ExportDashboardBody) => {
      const { endpoint, data } = buildExportBody(body, 'png');
      return post(endpoint, { responseType: 'blob', data });
    },
    {
      onSuccess: data => {
        downloadJs(data, `${fileName}.png`);
      },
    },
  );
};
