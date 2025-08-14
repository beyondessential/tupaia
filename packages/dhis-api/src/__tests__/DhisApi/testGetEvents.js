import { when } from 'jest-when';

import { createDhisApi } from './helpers';
import { DATA_ELEMENTS, PROGRAM } from './testGetEventAnalytics.fixtures';

const createFetchStub = () => {
  const fetchStub = jest.fn();
  when(fetchStub)
    .calledWith(
      'programs',
      {
        fields: expect.arrayContaining(['id']),
        filter: { code: PROGRAM.code },
      },
      undefined,
    )
    .mockResolvedValue({ programs: [{ id: PROGRAM.id }] })
    .calledWith(
      'dataElements',
      {
        fields: expect.arrayContaining(['id', 'code']),
        filter: {
          comparator: 'in',
          code: expect.toBeOneOf([
            '[FEMALE_POPULATION,MALE_POPULATION]',
            '[MALE_POPULATION,FEMALE_POPULATION]',
          ]),
        },
      },
      undefined,
    )
    .mockResolvedValue({ dataElements: DATA_ELEMENTS })
    .calledWith(
      'organisationUnits',
      {
        fields: ['id'],
        filter: {
          code: 'TO',
        },
      },
      undefined,
    )
    .mockResolvedValue({ organisationUnits: [{ id: 'to_dhisId' }] })
    .calledWith('events/dhis_event_id1', expect.anything(), undefined)
    .mockResolvedValue({ dataValues: {} });

  return fetchStub;
};

const dhisApi = createDhisApi({
  fetch: createFetchStub(),
});

export const testGetEvents = () => {
  it('translates codes to ids in the provided query', async () => {
    await dhisApi.getEvents({
      programCode: PROGRAM.code,
      organisationUnitCode: 'TO',
      eventId: 'dhis_event_id1',
    });
    return expect(dhisApi.fetcher.fetch).toHaveBeenLastCalledWith(
      'events/dhis_event_id1',
      {
        program: PROGRAM.id,
        orgUnit: 'to_dhisId',
        programIdScheme: 'code',
        orgUnitIdScheme: 'code',
        ouMode: 'DESCENDANTS',
        trackedEntityInstance: undefined,
      },
      undefined,
    );
  });

  it('does not translate codes to ids if ids are provided', async () => {
    // Some dhis configurations do not have codes against their data elements or programs etc. The way
    // to work with these is to send ids instead, and if we specify ids we must make sure not to attempt
    // to retrieve ids from the codes we pass in (because they will be not be defined).
    await dhisApi.getEvents({
      programId: PROGRAM.id,
      organisationUnitId: 'to_dhisId',
      eventId: 'dhis_event_id1',
    });
    return expect(dhisApi.fetcher.fetch).toHaveBeenCalledOnceWith(
      'events/dhis_event_id1',
      {
        program: PROGRAM.id,
        orgUnit: 'to_dhisId',
        programIdScheme: 'code',
        orgUnitIdScheme: 'code',
        ouMode: 'DESCENDANTS',
        trackedEntityInstance: undefined,
      },
      undefined,
    );
  });
};
