import { buildEventsFromDhisEventAnalytics } from '../../../../services/dhis/builders/buildEventsFromDhisEventAnalytics';
import { EVENT_ANALYTICS } from './buildAnalytics.fixtures';
import { createModelsStub } from '../DhisService.stubs';

describe('buildEventsFromDhisEventAnalytics()', () => {
  const models = createModelsStub();

  it('allows empty data element codes', async () => {
    await expect(
      buildEventsFromDhisEventAnalytics(models, EVENT_ANALYTICS.withDataValues),
    ).toResolve();
    await expect(
      buildEventsFromDhisEventAnalytics(models, EVENT_ANALYTICS.withDataValues, []),
    ).toResolve();
  });

  it('builds events containing no data values', async () => {
    const events = await buildEventsFromDhisEventAnalytics(models, EVENT_ANALYTICS.noDataValues);
    expect(events).toStrictEqual([
      {
        event: 'event1_dhisId',
        orgUnit: 'TO_Nukuhc',
        orgUnitName: 'Nukunuku',
        eventDate: '2020-02-06T10:18:00.000',
        dataValues: {},
      },
      {
        event: 'event2_dhisId',
        orgUnit: 'TO_HvlMCH',
        orgUnitName: 'Haveluloto',
        eventDate: '2020-02-07T14:33:00.000',
        dataValues: {},
      },
    ]);
  });

  it('builds events from DHIS2 event analytics and sorts them by period', async () => {
    const events = await buildEventsFromDhisEventAnalytics(models, EVENT_ANALYTICS.withDataValues, [
      'BCD1',
      'BCD2',
    ]);
    expect(events).toStrictEqual([
      {
        event: 'event1_dhisId',
        orgUnit: 'TO_Nukuhc',
        orgUnitName: 'Nukunuku',
        eventDate: '2020-02-06T10:18:00.000',
        dataValues: {
          BCD1: 10,
          BCD2: 'Comment 1',
        },
      },
      {
        event: 'event2_dhisId',
        orgUnit: 'TO_HvlMCH',
        orgUnitName: 'Haveluloto',
        eventDate: '2020-02-07T14:33:00.000',
        dataValues: {
          BCD1: 20,
          BCD2: 'Comment 2',
        },
      },
    ]);
  });

  it('maps tracked entity ids to entity codes', async () => {
    const events = await buildEventsFromDhisEventAnalytics(
      models,
      EVENT_ANALYTICS.withTrackedEntityIds,
      ['BCD1'],
    );
    expect(events).toStrictEqual([
      {
        event: 'event1_dhisId',
        orgUnit: 'TO_Nukuhc',
        orgUnitName: 'Nukunuku',
        eventDate: '2020-02-06T10:18:00.000',
        dataValues: {},
        trackedEntityId: 'tracked_entity_id_dl_household_1',
        trackedEntityCode: 'DL_HOUSEHOLD_1',
      },
      {
        event: 'event2_dhisId',
        orgUnit: 'TO_HvlMCH',
        orgUnitName: 'Haveluloto',
        eventDate: '2020-02-07T14:33:00.000',
        dataValues: {},
        trackedEntityId: 'tracked_entity_id_dl_household_3',
        trackedEntityCode: '', // returns empty string if it cant map
      },
    ]);
  });
});
