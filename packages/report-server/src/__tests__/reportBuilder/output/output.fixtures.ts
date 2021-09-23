/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const MULTIPLE_TRANSFORMED_DATA = {
  results: [
    { FacilityType: 'hospital', Laos: 3, Tonga: 0 },
    { FacilityType: 'clinic', Laos: 4, Tonga: 9 },
    { FacilityType: 'park', Laos: 2, Tonga: 0 },
    { FacilityType: 'library', Laos: 0, Tonga: 5 },
  ],
};

export const MULTIPLE_TRANSFORMED_DATA_WITH_PERIOD = {
  results: [
    { period: '20210920', FacilityType: 'hospital', Laos: 3, Tonga: 0 },
    { period: '20210921', FacilityType: 'clinic', Laos: 4, Tonga: 9 },
    { period: '20210922', FacilityType: 'park', Laos: 2, Tonga: 0 },
    { period: '20210923', FacilityType: 'library', Laos: 0, Tonga: 5 },
  ],
  period: {
    requested: '20210919;20210920;20210921;20210922;20210923;20210924',
    earliestAvailable: '20210920',
    latestAvailable: '20210923',
  },
};

export const MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES = {
  results: [
    { InfrastructureType: 'medical center', FacilityType: 'hospital', Laos: 3, Tonga: 0 },
    { InfrastructureType: 'medical center', FacilityType: 'clinic', Laos: 4, Tonga: 9 },
    { InfrastructureType: 'others', FacilityType: 'park', Laos: 2, Tonga: 0 },
    { InfrastructureType: 'others', FacilityType: 'library', Laos: 0, Tonga: 5 },
  ],
};

export const MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS = {
  results: [
    { InfrastructureType: 'medical center', FacilityType: 'hospital', Laos: 3, Tonga: 0 },
    { InfrastructureType: 'medical center', FacilityType: 'clinic', Laos: 4, Tonga: 9 },
    { InfrastructureType: 'others', FacilityType: 'park', Tonga: 0 },
    { InfrastructureType: 'others', FacilityType: 'library', Tonga: 5 },
  ],
};
