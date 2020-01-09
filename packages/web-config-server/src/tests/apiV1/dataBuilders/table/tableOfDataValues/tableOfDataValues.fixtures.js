/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * CD1: 'Risk Factor: Smokers Female'
 * CD2: 'Risk Factor: Smokers Male'
 * CD3: 'Risk Factor: Overweight Female'
 * CD4: 'Risk Factor: Overweight Male'
 * CD5: 'CVD Risk: Green Female'
 * CD6: 'CVD Risk: Green Male'
 * CD7: 'CVD Risk: Red Female'
 * CD8: 'CVD Risk: Red Male'
 */

export const DATA_VALUES = [
  // Nukunuku
  { dataElement: 'CD1', value: 1, organisationUnit: 'TO_Nukuhc' },
  { dataElement: 'CD2', value: 2, organisationUnit: 'TO_Nukuhc' },
  { dataElement: 'CD3', value: 3, organisationUnit: 'TO_Nukuhc' },
  { dataElement: 'CD4', value: 4, organisationUnit: 'TO_Nukuhc' },
  { dataElement: 'CD5', value: 5, organisationUnit: 'TO_Nukuhc' },
  { dataElement: 'CD6', value: 6, organisationUnit: 'TO_Nukuhc' },
  { dataElement: 'CD7', value: 7, organisationUnit: 'TO_Nukuhc' },
  { dataElement: 'CD8', value: 8, organisationUnit: 'TO_Nukuhc' },
  // Vaini
  { dataElement: 'CD1', value: 10, organisationUnit: 'TO_Vainihc' },
  { dataElement: 'CD2', value: 20, organisationUnit: 'TO_Vainihc' },
  { dataElement: 'CD3', value: 30, organisationUnit: 'TO_Vainihc' },
  { dataElement: 'CD4', value: 40, organisationUnit: 'TO_Vainihc' },
  { dataElement: 'CD5', value: 50, organisationUnit: 'TO_Vainihc' },
  { dataElement: 'CD6', value: 60, organisationUnit: 'TO_Vainihc' },
  { dataElement: 'CD7', value: 70, organisationUnit: 'TO_Vainihc' },
  { dataElement: 'CD8', value: 80, organisationUnit: 'TO_Vainihc' },
];

export const ORG_UNITS = [
  { code: 'TO_Nukuhc', name: 'Nukunuku' },
  { code: 'TO_Vainihc', name: 'Vaini' },
];
