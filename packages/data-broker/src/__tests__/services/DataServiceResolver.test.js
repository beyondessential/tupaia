/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataServiceResolver } from '../../services/DataServiceResolver';
import {
  createModelsStub,
  DATA_ELEMENTS,
  DATA_GROUPS,
  ENTITIES,
} from './DataServiceResolver.stubs';

describe('DataServiceResolver', () => {
  let resolver;

  beforeEach(() => {
    resolver = new DataServiceResolver(createModelsStub());
  });

  it('throws if multiple mappings found', () =>
    expect(
      resolver.getMapping([DATA_ELEMENTS.DE_4_MAPPED_INVALID], ENTITIES.FJ_Facility_1),
    ).toBeRejectedWith(
      'Conflicting mappings found for Data Source DE_4_MAPPED_INVALID when fetching for orgUnits FJ_Facility_1',
    ));

  describe('data elements', () => {
    it('resolves to default data service if no country mappings set', () =>
      expect(
        resolver.getMapping([DATA_ELEMENTS.DE_1_NOT_MAPPED], ENTITIES.FJ_Facility_1),
      ).resolves.toEqual({
        dataElementMapping: [
          {
            dataSource: DATA_ELEMENTS.DE_1_NOT_MAPPED,
            service_type: DATA_ELEMENTS.DE_1_NOT_MAPPED.service_type,
            config: DATA_ELEMENTS.DE_1_NOT_MAPPED.config,
          },
        ],
        dataGroupMapping: [],
      }));

    it('resolves to default data service if no entity specified', () =>
      expect(resolver.getMapping([DATA_ELEMENTS.DE_2_MAPPED], undefined)).resolves.toEqual({
        dataElementMapping: [
          {
            dataSource: DATA_ELEMENTS.DE_2_MAPPED,
            service_type: DATA_ELEMENTS.DE_2_MAPPED.service_type,
            config: DATA_ELEMENTS.DE_2_MAPPED.config,
          },
        ],
        dataGroupMapping: [],
      }));

    it('resolves to country data service if country mapping set', () =>
      expect(
        resolver.getMapping([DATA_ELEMENTS.DE_2_MAPPED], ENTITIES.FJ_Facility_1),
      ).resolves.toEqual({
        dataElementMapping: [
          {
            dataSource: DATA_ELEMENTS.DE_2_MAPPED,
            service_type: 'dhis',
            config: { dhisInstanceCode: 'dhis_instance_2' },
          },
        ],
        dataGroupMapping: [],
      }));

    it('resolves to default data service if entity above country level specified', () =>
      expect(resolver.getMapping([DATA_ELEMENTS.DE_2_MAPPED], ENTITIES.PROJECT_1)).resolves.toEqual(
        {
          dataElementMapping: [
            {
              dataSource: DATA_ELEMENTS.DE_2_MAPPED,
              service_type: DATA_ELEMENTS.DE_2_MAPPED.service_type,
              config: DATA_ELEMENTS.DE_2_MAPPED.config,
            },
          ],
          dataGroupMapping: [],
        },
      ));

    describe('multiple org units', () => {
      /**
       * In this case, we are wanting to know where DE_2_MAPPED is stored, for data in multiple countries.
       * The answer must be a single data service.
       */

      it('throws if it resolves a single data element to multiple data services', () =>
        expect(
          resolver.getMappingMultipleOrgUnits(
            [DATA_ELEMENTS.DE_2_MAPPED],
            [ENTITIES.FJ_Facility_1, ENTITIES.TO_Facility_1],
          ),
        ).toBeRejectedWith(
          'Conflicting mappings found for Data Source DE_2_MAPPED when fetching for orgUnits FJ_Facility_1,TO_Facility_1',
        ));

      it('returns the data service', () =>
        expect(
          resolver.getMappingMultipleOrgUnits(
            [DATA_ELEMENTS.DE_3_MAPPED],
            [ENTITIES.FJ_Facility_1, ENTITIES.TO_Facility_1],
          ),
        ).resolves.toEqual({
          dataElementMapping: [
            {
              dataSource: DATA_ELEMENTS.DE_3_MAPPED,
              service_type: 'dhis',
              config: { dhisInstanceCode: 'dhis_instance_3' },
            },
          ],
          dataGroupMapping: [],
        }));
    });
  });

  describe('data groups', () => {
    it('resolves to default data service', () =>
      expect(resolver.getMapping([DATA_GROUPS.DG_1], ENTITIES.FJ_Facility_1)).resolves.toEqual({
        dataElementMapping: [],
        dataGroupMapping: [
          {
            dataSource: DATA_GROUPS.DG_1,
            service_type: DATA_GROUPS.DG_1.service_type,
            config: DATA_GROUPS.DG_1.config,
          },
        ],
      }));
  });
});
