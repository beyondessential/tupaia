export const formatFacilityDataForOverlay = ({ code: organisationUnitCode, ...e }) => ({
  ...e,
  organisationUnitCode,
});
