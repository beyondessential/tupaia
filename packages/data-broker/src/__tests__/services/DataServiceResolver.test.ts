import { DataServiceResolver } from '../../services/DataServiceResolver';
import {
  createModelsStub,
  DATA_ELEMENTS,
  DATA_GROUPS,
  ENTITIES,
  SYNC_GROUPS,
} from './DataServiceResolver.stubs';

describe('DataServiceResolver', () => {
  let resolver: DataServiceResolver;

  beforeEach(() => {
    resolver = new DataServiceResolver(createModelsStub());
  });

  it('throws if multiple mappings found', () =>
    expect(
      resolver.getMapping([DATA_ELEMENTS.DE_4_MAPPED_INVALID], ENTITIES.FJ_Facility_1),
    ).toBeRejectedWith(
      'Multiple mappings found for Data Element DE_4_MAPPED_INVALID for country FJ',
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
        syncGroupMapping: [],
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
        syncGroupMapping: [],
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
        syncGroupMapping: [],
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
          syncGroupMapping: [],
        },
      ));
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
        syncGroupMapping: [],
      }));
  });

  describe('sync groups', () => {
    it('resolves to default data service', () =>
      expect(resolver.getMapping([SYNC_GROUPS.SG_1], ENTITIES.FJ_Facility_1)).resolves.toEqual({
        dataElementMapping: [],
        dataGroupMapping: [],
        syncGroupMapping: [
          {
            dataSource: SYNC_GROUPS.SG_1,
            service_type: SYNC_GROUPS.SG_1.service_type,
            config: SYNC_GROUPS.SG_1.config,
          },
        ],
      }));
  });
});
