/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { NEW_EVENTS, OLD_EVENTS } from '../events';
import { aggregateEvents } from '../../../events/aggregateEvents';
import { AGGREGATION_TYPES } from '../../../aggregationTypes';

describe('aggregateEvents()', () => {
  it('invalid aggregation type', () => {
    expect(() => aggregateEvents(NEW_EVENTS, 'NONEXISTANT')).to.throw('Aggregation type not found');
    expect(() => aggregateEvents(OLD_EVENTS, 'NONEXISTANT')).to.throw('Aggregation type not found');
  });
  it('empty aggregation type', () => {
    expect(aggregateEvents(NEW_EVENTS)).to.deep.equal(NEW_EVENTS);
    expect(aggregateEvents(OLD_EVENTS)).to.deep.equal(OLD_EVENTS);
    expect(aggregateEvents(NEW_EVENTS, undefined)).to.deep.equal(NEW_EVENTS);
    expect(aggregateEvents(OLD_EVENTS, undefined)).to.deep.equal(OLD_EVENTS);
  });
  describe('REPLACE_ORG_UNIT_WITH_ORG_GROUP', () => {
    it('works with new event api', () => {
      const aggregationConfig = {
        orgUnitMap: {
          Org_Unit_1: { code: 'Parent_1', name: 'Parent 1' },
          Org_Unit_2: { code: 'Parent_1', name: 'Parent 1' },
          Org_Unit_3: { code: 'Parent_2', name: 'Parent 2' },
          Org_Unit_4: { code: 'Parent_2', name: 'Parent 2' },
        },
      };
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
          orgUnitName: 'Parent 2',
          orgUnit: 'Parent_2',
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
          NEW_EVENTS,
          AGGREGATION_TYPES.REPLACE_ORG_UNIT_WITH_ORG_GROUP,
          aggregationConfig,
        ),
      ).to.deep.equal(expectedResponse);
    });

    it('works with old event api', () => {
      const aggregationConfig = {
        orgUnitMap: {
          Org_Unit_1: { code: 'Parent_1', name: 'Parent 1' },
          Org_Unit_2: { code: 'Parent_1', name: 'Parent 1' },
          Org_Unit_3: { code: 'Parent_2', name: 'Parent 2' },
          Org_Unit_4: { code: 'Parent_2', name: 'Parent 2' },
        },
      };
      const expectedResponse = [
        {
          storedBy: 'TupaiaApp',
          dueDate: '2020-02-11T02:59:01.927',
          program: 'SCRF',
          href: 'https://dev-aggregation.tupaia.org/api/events/ZZ6QeE2WcDe',
          event: 'ZZ6QeE2WcDe',
          programStage: 'xs5ESLfdbqU',
          orgUnit: 'Parent_1',
          trackedEntityInstance: 'qgv0YP2rjgv',
          enrollment: 'aFaSY7k1R2j',
          enrollmentStatus: 'ACTIVE',
          status: 'ACTIVE',
          orgUnitName: 'Parent 1',
          eventDate: '2020-02-06T10:18:00.000',
          attributeCategoryOptions: 'xYerKDKCefk',
          lastUpdated: '2020-02-11T02:59:01.956',
          created: '2020-02-11T02:59:01.930',
          followup: false,
          deleted: false,
          attributeOptionCombo: 'HllvX50cXC0',
          notes: [],
          dataValues: {
            ELEMENT_1: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: '9.2',
              providedElsewhere: false,
              dataElement: 'ELEMENT_1',
            },
            ELEMENT_2: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: '0',
              providedElsewhere: false,
              dataElement: 'ELEMENT_2',
            },
            EXTRANIOUS_ELEMENT: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: 'Paracetamol',
              providedElsewhere: false,
              dataElement: 'EXTRANIOUS_ELEMENT',
            },
          },
        },
        {
          storedBy: 'TupaiaApp',
          dueDate: '2020-02-11T02:59:01.927',
          program: 'SCRF',
          href: 'https://dev-aggregation.tupaia.org/api/events/ZZ6QeE2WcDe',
          event: 'ZZ6QeE2WcDe',
          programStage: 'xs5ESLfdbqU',
          orgUnit: 'Parent_1',
          trackedEntityInstance: 'qgv0YP2rjgv',
          enrollment: 'aFaSY7k1R2j',
          enrollmentStatus: 'ACTIVE',
          status: 'ACTIVE',
          orgUnitName: 'Parent 1',
          eventDate: '2020-02-06T10:18:00.000',
          attributeCategoryOptions: 'xYerKDKCefk',
          lastUpdated: '2020-02-11T02:59:01.956',
          created: '2020-02-11T02:59:01.930',
          followup: false,
          deleted: false,
          attributeOptionCombo: 'HllvX50cXC0',
          notes: [],
          dataValues: {
            ELEMENT_1: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: '9.2',
              providedElsewhere: false,
              dataElement: 'ELEMENT_1',
            },
            ELEMENT_2: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: '0',
              providedElsewhere: false,
              dataElement: 'ELEMENT_2',
            },
            EXTRANIOUS_ELEMENT: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: 'Paracetamol',
              providedElsewhere: false,
              dataElement: 'EXTRANIOUS_ELEMENT',
            },
          },
        },
        {
          storedBy: 'TupaiaApp',
          dueDate: '2020-02-11T02:59:01.927',
          program: 'SCRF',
          href: 'https://dev-aggregation.tupaia.org/api/events/ZZ6QeE2WcDe',
          event: 'ZZ6QeE2WcDe',
          programStage: 'xs5ESLfdbqU',
          orgUnit: 'Parent_1',
          trackedEntityInstance: 'qgv0YP2rjgv',
          enrollment: 'aFaSY7k1R2j',
          enrollmentStatus: 'ACTIVE',
          status: 'ACTIVE',
          orgUnitName: 'Parent 1',
          eventDate: '2020-02-06T10:18:00.000',
          attributeCategoryOptions: 'xYerKDKCefk',
          lastUpdated: '2020-02-11T02:59:01.956',
          created: '2020-02-11T02:59:01.930',
          followup: false,
          deleted: false,
          attributeOptionCombo: 'HllvX50cXC0',
          notes: [],
          dataValues: {
            ELEMENT_1: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: '9.2',
              providedElsewhere: false,
              dataElement: 'ELEMENT_1',
            },
            ELEMENT_2: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: '0',
              providedElsewhere: false,
              dataElement: 'ELEMENT_2',
            },
            EXTRANIOUS_ELEMENT: {
              lastUpdated: '2020-02-11T02:59:01.938',
              storedBy: 'TupaiaApp',
              created: '2020-02-11T02:59:01.938',
              value: 'Paracetamol',
              providedElsewhere: false,
              dataElement: 'EXTRANIOUS_ELEMENT',
            },
          },
        },
      ];

      expect(
        aggregateEvents(
          OLD_EVENTS,
          AGGREGATION_TYPES.REPLACE_ORG_UNIT_WITH_ORG_GROUP,
          aggregationConfig,
        ),
      ).to.deep.equal(expectedResponse);
    });
  });
});
