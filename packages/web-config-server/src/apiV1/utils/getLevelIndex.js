export const UNKNOWN_LEVEL = 'Unknown';

export const WORLD_INDEX = 1;
export const COUNTRY_INDEX = 2;
export const DISTRICT_INDEX = 3;
export const SUBDISTRICT_INDEX = 4;
export const FACILITY_INDEX = 5;

export function getLevelIndex(level) {
  if (!level) return UNKNOWN_LEVEL;

  switch (level) {
    case 'World':
      return WORLD_INDEX;
    case 'Country':
      return COUNTRY_INDEX;
    case 'District':
      return DISTRICT_INDEX;
    case 'Subdistrict':
      return SUBDISTRICT_INDEX;
    case 'Facility':
      return FACILITY_INDEX;
    default:
      throw new Error(`Unknown Organisational Unit Level: ${level}`);
  }
}
