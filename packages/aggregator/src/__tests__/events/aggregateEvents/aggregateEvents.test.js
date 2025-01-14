import { aggregateEvents } from '../../../events/aggregateEvents';
import { AGGREGATION_TYPES } from '../../../aggregationTypes';

const EVENTS = [
  {
    dataValues: { ELEMENT_1: 1, ELEMENT_2: 'Text 1' },
    event: 'ZZ6QeE2WcDe1',
    eventDate: '2019-02-06 10:18:00.0',
    orgUnitName: 'Org Unit 1',
    orgUnit: 'Org_Unit_1',
  },
  {
    dataValues: { ELEMENT_1: 2, ELEMENT_2: 'Text 2' },
    event: 'ZZ6QeE2WcDe2',
    eventDate: '2020-02-06 10:18:00.0',
    orgUnitName: 'Org Unit 1',
    orgUnit: 'Org_Unit_1',
  },
  {
    dataValues: { ELEMENT_1: 3, ELEMENT_2: 'Text 3' },
    event: 'ZZ6QeE2WcDe3',
    eventDate: '2020-03-06 10:18:00.0',
    orgUnitName: 'Org Unit 2',
    orgUnit: 'Org_Unit_2',
  },
  {
    dataValues: { ELEMENT_1: 4, ELEMENT_2: 'Text 4' },
    event: 'ZZ6QeE2WcDe4',
    eventDate: '2020-04-06 10:18:00.0',
    orgUnitName: 'Org Unit 3',
    orgUnit: 'Org_Unit_3',
  },
  {
    dataValues: { ELEMENT_1: 5, ELEMENT_2: 'Text 5' },
    event: 'ZZ6QeE2WcDe5',
    eventDate: '2020-05-06 10:18:00.0',
    orgUnitName: 'Org Unit 4',
    orgUnit: 'Org_Unit_4',
  },
  {
    dataValues: { ELEMENT_1: 6, ELEMENT_2: 'Text 6' },
    event: 'ZZ6QeE2WcDe6',
    eventDate: '2020-06-06 10:18:00.0',
    orgUnitName: 'Org Unit 1',
    orgUnit: 'Org_Unit_1',
  },
];

const aggregationConfig = {
  orgUnitMap: {
    Org_Unit_1: { code: 'Parent_1', name: 'Parent 1' },
    Org_Unit_2: { code: 'Parent_1', name: 'Parent 1' },
    Org_Unit_3: { code: 'Parent_2', name: 'Parent 2' },
    // Org_Unit_4: Not defined
  },
};

describe('aggregateEvents()', () => {
  it('invalid aggregation type', () => {
    expect(() => aggregateEvents(EVENTS, 'NONEXISTANT')).toThrowError('Aggregation type not found');
    expect(() => aggregateEvents(EVENTS, null)).toThrowError('Aggregation type not found');
  });

  it('empty aggregation type', () => {
    expect(aggregateEvents(EVENTS)).toStrictEqual(EVENTS);
    expect(aggregateEvents(EVENTS, undefined)).toStrictEqual(EVENTS);
  });

  describe('REPLACE_ORG_UNIT_WITH_ORG_GROUP', () => {
    it('replaces org units correctly', () => {
      const expectedResponse = [
        {
          dataValues: { ELEMENT_1: 1, ELEMENT_2: 'Text 1' },
          event: 'ZZ6QeE2WcDe1',
          eventDate: '2019-02-06 10:18:00.0',
          orgUnitName: 'Parent 1',
          orgUnit: 'Parent_1',
        },
        {
          dataValues: { ELEMENT_1: 2, ELEMENT_2: 'Text 2' },
          event: 'ZZ6QeE2WcDe2',
          eventDate: '2020-02-06 10:18:00.0',
          orgUnitName: 'Parent 1',
          orgUnit: 'Parent_1',
        },
        {
          dataValues: { ELEMENT_1: 3, ELEMENT_2: 'Text 3' },
          event: 'ZZ6QeE2WcDe3',
          eventDate: '2020-03-06 10:18:00.0',
          orgUnitName: 'Parent 1',
          orgUnit: 'Parent_1',
        },
        {
          dataValues: { ELEMENT_1: 4, ELEMENT_2: 'Text 4' },
          event: 'ZZ6QeE2WcDe4',
          eventDate: '2020-04-06 10:18:00.0',
          orgUnitName: 'Parent 2',
          orgUnit: 'Parent_2',
        },
        {
          dataValues: { ELEMENT_1: 5, ELEMENT_2: 'Text 5' },
          event: 'ZZ6QeE2WcDe5',
          eventDate: '2020-05-06 10:18:00.0',
          orgUnitName: 'Org Unit 4',
          orgUnit: 'Org_Unit_4',
        },
        {
          dataValues: { ELEMENT_1: 6, ELEMENT_2: 'Text 6' },
          event: 'ZZ6QeE2WcDe6',
          eventDate: '2020-06-06 10:18:00.0',
          orgUnitName: 'Parent 1',
          orgUnit: 'Parent_1',
        },
      ];

      expect(
        aggregateEvents(
          EVENTS,
          AGGREGATION_TYPES.REPLACE_ORG_UNIT_WITH_ORG_GROUP,
          aggregationConfig,
        ),
      ).toStrictEqual(expectedResponse);
    });

    it('works with no events', () => {
      const expectedResponse = [];
      expect(
        aggregateEvents([], AGGREGATION_TYPES.REPLACE_ORG_UNIT_WITH_ORG_GROUP, aggregationConfig),
      ).toStrictEqual(expectedResponse);
    });
  });
});
