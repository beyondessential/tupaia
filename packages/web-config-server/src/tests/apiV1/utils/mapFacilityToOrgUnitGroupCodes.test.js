/**
 * Tupaia MediTrak
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { mapFacilityToOrgUnitGroupCodes } from '/apiV1/utils/mapFacilityToOrgUnitGroupCodes';

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

describe('mapFacilityToOrgUnitGroupCodes', () => {
  it('should map facility ids to group codes', () => {
    expect(mapFacilityToOrgUnitGroupCodes(organisationUnits)).to.deep.equal({
      As8RCJJNVGC: 'SB_Guadalcanal Province',
      IYRU3RH79ti: 'SB_Guadalcanal Province',
      GqumUN45VC8: 'SB_Guadalcanal Province',
      HxGTP4vnkfn: 'SB_Guadalcanal Province',
      ODdaT8ncTzt: 'SB_Honiara',
      yLzHFimWVVF: 'SB_Honiara',
      iyd21zEg9jS: 'SB_Honiara',
      xeNth7JPCGf: 'SB_Honiara',
      UbnIMaXikNf: 'SB_Honiara',
    });
  });
});
