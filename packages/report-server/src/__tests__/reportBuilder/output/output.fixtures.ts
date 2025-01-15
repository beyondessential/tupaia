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

export const MULTIPLE_TRANSFORMED_DATA_FOR_RAW_DATA_EXPORT = [
  { EntityName: 'clinic', dataElement_A: 3, dataElement_B: 0 },
  { EntityName: 'hospital', dataElement_A: 4, dataElement_B: 9 },
  { EntityName: 'park', dataElement_B: 0 },
  { EntityName: 'others', dataElement_B: 5 },
];
