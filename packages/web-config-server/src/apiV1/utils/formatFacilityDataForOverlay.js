import { geoJsonToFrontEndCoordinates } from '/apiV1/utils';

export const formatFacilityDataForOverlay = ({
  point,
  code: organisationUnitCode,
  type_name: facilityTypeName,
  category_code: facilityTypeCode,
  image_url: photoUrl,
  ...e
}) => ({
  ...e,
  organisationUnitCode,
  coordinates: geoJsonToFrontEndCoordinates(point),
  facilityTypeCode,
  facilityTypeName,
  photoUrl,
  orgUnitLevel: facilityTypeCode,
});
