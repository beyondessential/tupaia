/**
 * Tupaia MediTrak
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */
import { mapOrgUnitIdsToGroupIds } from '/apiV1/utils/mapOrgUnitIdsToGroupIds';

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

describe('mapOrgUnitIdsToGroupIds', () => {
  it('should map facility ids to group ids', () => {
    expect(mapOrgUnitIdsToGroupIds(organisationUnits)).toStrictEqual({
      As8RCJJNVGC: 'As8RCJJNVGC',
      IYRU3RH79ti: 'As8RCJJNVGC',
      GqumUN45VC8: 'As8RCJJNVGC',
      HxGTP4vnkfn: 'As8RCJJNVGC',
      xeNth7JPCGf: 'xeNth7JPCGf',
      UbnIMaXikNf: 'xeNth7JPCGf',
      ODdaT8ncTzt: 'xeNth7JPCGf',
      yLzHFimWVVF: 'xeNth7JPCGf',
      iyd21zEg9jS: 'xeNth7JPCGf',
    });
  });
});
