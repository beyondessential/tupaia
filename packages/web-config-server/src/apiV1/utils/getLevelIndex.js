export const UNKNOWN_LEVEL = 'Unknown';

export const WORLD_INDEX = 1;
export const COUNTRY_INDEX = 2;
export const DISTRICT_INDEX = 3;
export const SUBDISTRICT_INDEX = 4;
export const FACILITY_INDEX = 5;

export function getLevelIndex(level) {
  if (!level) return UNKNOWN_LEVEL;

  switch (level.toLowerCase()) {
    case 'world':
      return WORLD_INDEX;
    case 'country':
      return COUNTRY_INDEX;
    case 'district':
    case 'region':
      return DISTRICT_INDEX;
    case 'subdistrict':
      return SUBDISTRICT_INDEX;
    case 'facility':
      return FACILITY_INDEX;
    default:
      throw new Error(`Unknown Organisational Unit Level: ${level}`);
  }
}
