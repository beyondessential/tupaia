/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { MockEntityApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { ReqContext } from '../../../reportBuilder/context';

import { testCustomReport } from '../../../reportBuilder/customReports/testCustomReport';

describe('testCustomReport', () => {
  const HIERARCHY = 'test_hierarchy';
  const ENTITIES = {
    test_hierarchy: [
      { code: 'FJ', name: 'Fiji', type: 'country' },
      { code: 'FJ_Facility', name: 'Fiji Facility', type: 'facility' },
      { code: 'TO', name: 'Tonga', type: 'country' },
      {
        code: 'TO_District',
        name: 'Tonga District',
        type: 'district',
      },
      {
        code: 'TO_Facility1',
        name: 'Tonga Facility 1',
        type: 'facility',
      },
      {
        code: 'TO_Facility2',
        name: 'Tonga Facility 2',
        type: 'facility',
      },
    ],
  };

  const RELATIONS = {
    test_hierarchy: [
      { parent: 'TO', child: 'TO_District' },
      { parent: 'TO_District', child: 'TO_Facility1' },
      { parent: 'TO_District', child: 'TO_Facility2' },
      { parent: 'FJ', child: 'FJ_Facility' },
    ],
  };

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Public',
    services: new MockTupaiaApiClient({ entity: new MockEntityApi(ENTITIES, RELATIONS) }),
    accessPolicy: new AccessPolicy({ AU: ['Public'] }),
  };

  it('calculates number of facilities in requested entity', async () => {
    const numberOfFacilitiesInTonga = await testCustomReport(reqContext, {
      organisationUnitCodes: ['TO'],
      hierarchy: 'test_hierarchy',
    });

    expect(numberOfFacilitiesInTonga).toEqual([{ value: 2 }]);
  });

  it('calculates number of facilities in requested entities', async () => {
    const numberOfFacilitiesInFijiAndTonga = await testCustomReport(reqContext, {
      organisationUnitCodes: ['TO', 'FJ'],
      hierarchy: 'test_hierarchy',
    });

    expect(numberOfFacilitiesInFijiAndTonga).toEqual([{ value: 3 }]);
  });
});
