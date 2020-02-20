import { geoJsonToFrontEndCoordinates } from '/apiV1/utils';

export const formatFacilityDataForOverlay = ({ code: organisationUnitCode, ...e }) => ({
  ...e,
  organisationUnitCode,
});
