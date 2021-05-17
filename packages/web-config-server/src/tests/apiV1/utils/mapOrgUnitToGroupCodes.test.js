/**
 * Tupaia MediTrak
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { mapOrgUnitCodeToGroup } from '/apiV1/utils/mapOrgUnitCodeToGroup';

const organisationUnits = [
  {
    code: 'SB_Guadalcanal Province',
    name: 'Guadalcanal Province',
    id: 'As8RCJJNVGC',
    description: '{"level":"District"}',
    comment: '[[-10.59505396,158.59292748800002],[-9.181143,161.338592912]]',
    children: [
      { code: 'SB_10503', level: 4, id: 'IYRU3RH79ti' },
      { code: 'SB_10203', level: 4, id: 'GqumUN45VC8' },
      { code: 'SB_10601', level: 4, id: 'HxGTP4vnkfn' },
    ],
  },
  {
    code: 'SB_Honiara',
    name: 'Honiara',
    id: 'xeNth7JPCGf',
    description: '{"level":"District"}',
    children: [
      { code: 'SB_90201', level: 4, id: 'ODdaT8ncTzt' },
      { code: 'SB_90301', level: 4, id: 'yLzHFimWVVF' },
      { code: 'SB_90305', level: 4, id: 'UbnIMaXikNf' },
      { code: 'SB_90205', level: 4, id: 'iyd21zEg9jS' },
    ],
  },
];

describe('mapOrgUnitCodeToGroup', () => {
  it('should map org unit codes to group info', () => {
    expect(mapOrgUnitCodeToGroup(organisationUnits)).to.deep.equal({
      'SB_Guadalcanal Province': 'SB_Guadalcanal Province',
      SB_10503: 'SB_Guadalcanal Province',
      SB_10203: 'SB_Guadalcanal Province',
      SB_10601: 'SB_Guadalcanal Province',
      SB_Honiara: 'SB_Honiara',
      SB_90201: 'SB_Honiara',
      SB_90301: 'SB_Honiara',
      SB_90305: 'SB_Honiara',
      SB_90205: 'SB_Honiara',
    });
  });
});
