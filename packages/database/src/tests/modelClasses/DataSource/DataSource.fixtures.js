/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// Some tests need to overwrite data source properties
// Return a new object on each call to avoid fixture mutation
export const getDataSources = () => ({
  dataElement_dhis: {
    id: 'dataElement_dhis',
    code: 'DE_DHIS',
    type: 'dataElement',
    service_type: 'dhis',
    config: {
      categoryOptionCombo: 'Female_50-70Years',
      dataElementCode: 'Gender_Age',
      isDataRegional: true,
    },
  },
  dataElement_tupaia: {
    id: 'dataElement_tupaia',
    code: 'DE_TUPAIA',
    type: 'dataElement',
    service_type: 'tupaia',
    config: {},
  },
  dataElement_other: {
    id: 'dataElement_other',
    code: 'DE_OTHER',
    type: 'dataElement',
    service_type: 'other',
    config: {},
  },
  dataGroup_dhis: {
    id: 'dataGroup_dhis',
    code: 'DG_DHIS',
    type: 'dataGroup',
    service_type: 'dhis',
    config: {
      isDataRegional: true,
    },
  },
  dataGroup_tupaia: {
    id: 'dataGroup_tupaia',
    code: 'DG_TUPAIA',
    type: 'dataGroup',
    service_type: 'tupaia',
    config: {},
  },
});
