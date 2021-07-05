/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const MULTIPLE_TRANSFORMED_DATA = [
  { FacilityType: 'hospital', Laos: 3, Tonga: 0 },
  { FacilityType: 'clinic', Laos: 4, Tonga: 9 },
  { FacilityType: 'park', Laos: 2, Tonga: 0 },
  { FacilityType: 'library', Laos: 0, Tonga: 5 },
];

export const MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES = [
  { InfrastructureType: 'medical center', FacilityType: 'hospital', Laos: 3, Tonga: 0 },
  { InfrastructureType: 'medical center', FacilityType: 'clinic', Laos: 4, Tonga: 9 },
  { InfrastructureType: 'others', FacilityType: 'park', Laos: 2, Tonga: 0 },
  { InfrastructureType: 'others', FacilityType: 'library', Laos: 0, Tonga: 5 },
];

export const MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS = [
  { InfrastructureType: 'medical center', FacilityType: 'hospital', Laos: 3, Tonga: 0 },
  { InfrastructureType: 'medical center', FacilityType: 'clinic', Laos: 4, Tonga: 9 },
  { InfrastructureType: 'others', FacilityType: 'park', Tonga: 0 },
  { InfrastructureType: 'others', FacilityType: 'library', Tonga: 5 },
];
