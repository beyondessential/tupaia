import MockDate from 'mockdate';
import { AccessPolicy } from '@tupaia/access-policy';
import { Aggregator } from '@tupaia/aggregator';
import { MockTupaiaApiClient, MockEntityApi } from '@tupaia/api-client';

import { ReqContext } from '../../../reportBuilder/context';
import { tongaCovidRawData } from '../../../reportBuilder/customReports/tongaCovidRawData';

import { ENTITIES, EVENTS, HIERARCHY, RELATIONS } from './tongaCovidRawData.fixtures';
import { ReportServerAggregator } from '../../../aggregator';

const CURRENT_DATE_STUB = '2020-12-15T00:00:00Z';

const fetchFakeEvents = (
  surveyCode: string,
  {
    organisationUnitCodes,
    dataElementCodes,
  }: { organisationUnitCodes: string[]; dataElementCodes: string[] },
) => {
  return EVENTS[surveyCode]
    .filter(event => organisationUnitCodes.includes(event.orgUnit))
    .map(event => ({
      ...event,
      dataValues: Object.fromEntries(
        Object.entries(event.dataValues).filter(([dataElementCode]) =>
          dataElementCodes.includes(dataElementCode),
        ),
      ),
    }));
};

describe('tongaCovidRawData', () => {
  const dataBroker = { context: {} };
  const aggregator = new Aggregator(dataBroker);
  aggregator.fetchEvents = fetchFakeEvents as any; // Stub out fetchEvents with fake test data
  const reportServerAggregator = new ReportServerAggregator(aggregator);
  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Public',
    services: new MockTupaiaApiClient({
      entity: new MockEntityApi(ENTITIES, RELATIONS),
    }),
    accessPolicy: new AccessPolicy({ AU: ['Public'] }),
    query: {
      organisationUnitCodes: ['TO'],
      hierarchy: 'test_hierarchy',
    },
    aggregator: reportServerAggregator,
  };

  beforeAll(() => {
    MockDate.set(CURRENT_DATE_STUB);
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('builds the tongaCovidRawData report', async () => {
    const expectedValue = {
      columns: [
        { key: 'Test ID', title: 'Test ID' },
        { key: 'Surname', title: 'Surname' },
        { key: 'Given Names', title: 'Given Names' },
        { key: 'Date of Birth', title: 'Date of Birth' },
        { key: 'Age', title: 'Age' },
        { key: 'Sex', title: 'Sex' },
        { key: 'Phone No.', title: 'Phone No.' },
        { key: 'Island Group', title: 'Island Group' },
        { key: 'Village Code', title: 'Village Code' },
        { key: 'Address', title: 'Address' },
        { key: 'Date of Test', title: 'Date of Test' },
        { key: 'Result', title: 'Result' },
        { key: 'New Case', title: 'New Case' },
        { key: 'Estimated Recovery Date', title: 'Estimated Recovery Date' },
        { key: 'Test Type', title: 'Test Type' },
        { key: 'CT Value', title: 'CT Value' },
        { key: 'Vaccination Status', title: 'Vaccination Status' },
        { key: 'Outbound Traveller', title: 'Outbound Traveller' },
        { key: 'inbound Traveller', title: 'inbound Traveller' },
        { key: 'Symptomatic', title: 'Symptomatic' },
        { key: 'Date of Symptomatic Onset', title: 'Date of Symptomatic Onset' },
        { key: 'Quarantine', title: 'Quarantine' },
        { key: 'Primary Contact', title: 'Primary Contact' },
        { key: 'Frontliner', title: 'Frontliner' },
        { key: 'Frontliner Type', title: 'Frontliner Type' },
        { key: 'Other', title: 'Other' },
        { key: 'Community Testing', title: 'Community Testing' },
        { key: 'Patient', title: 'Patient' },
        { key: 'Other Reason', title: 'Other Reason' },
        { key: 'Primary Contact Testing Day', title: 'Primary Contact Testing Day' },
        { key: 'Testing Site', title: 'Testing Site' },
        { key: 'Quarantine Facility', title: 'Quarantine Facility' },
        { key: 'Ward Type', title: 'Ward Type' },
        { key: 'Clinic Type', title: 'Clinic Type' },
        { key: 'Health Center', title: 'Health Center' },
        { key: 'RRT Team Name', title: 'RRT Team Name' },
      ],
      rows: [
        {
          Address: 'Tonga Village 1',
          Age: 50,
          'CT Value': 7,
          'Clinic Type': 'Roomy',
          'Community Testing': 'Yes',
          'Date Previous Positive': 'N/A',
          'Date of Birth': '1970-01-01',
          'Date of Symptomatic Onset': '19/09/2022',
          'Date of Test': '2020-01-01',
          'Estimated Recovery Date': 'Not applicable',
          Frontliner: 'No',
          'Given Names': 'Paddington',
          'Health Center': 'Soccer pitch',
          'Inbound Traveller': 'No',
          'Island Group': 'Tonga Island 1',
          'New Case': 'Yes',
          Other: 'No',
          'Other Reason': 'No',
          'Other Results': 7,
          'Other Site': 'Nope',
          'Other Type': 'Basic',
          'Outbound Traveller': 'Yes',
          Patient: 'No',
          'Phone No.': '9012837273',
          'Previous Positive': 'No',
          'Primary Contact': 'Yes',
          'Primary Contact Testing Day': '13/09/2022',
          Quarantine: 'Yes',
          'Quarantine Facility': 'Car park',
          'RRT Team Name': 'What?',
          Result: 13,
          Sex: 'Female',
          Surname: 'Whiskers',
          Symptomatic: 'Yes',
          'Test ID': 'TO_Individual_2',
          'Test Type': 'Flu',
          'Testing Site': 'Disney Land',
          'Vaccination Status': 'Fully vaccinated',
          'Village Code': 'TO_Village_1',
          'Ward Type': 'Good',
          eventDate: '2020-01-01',
          orgUnit: 'TO_Individual_2',
        },
        {
          Address: 'Tonga Village 3',
          Age: 29,
          'CT Value': 4,
          'Clinic Type': 'Circular',
          'Community Testing': 'No',
          'Date Previous Positive': 'N/A',
          'Date of Birth': '1990-09-13',
          'Date of Test': '2020-05-19',
          'Estimated Recovery Date': 'Not applicable',
          Frontliner: 'No',
          'Frontliner Type': 'None',
          'Given Names': 'Super',
          'Health Center': 'Van',
          'Inbound Traveller': 'Yes',
          'Island Group': 'Tonga Island 2',
          'New Case': 'No',
          Other: 'No',
          'Other Reason': 'No',
          'Other Results': 4,
          'Other Site': 'None',
          'Other Type': 'Antigen',
          'Outbound Traveller': 'No',
          Patient: 'No',
          'Phone No.': '08090928',
          'Previous Positive': 'No',
          'Primary Contact': 'No',
          'Primary Contact Testing Day': 'N/A',
          Quarantine: 'No',
          'Quarantine Facility': 'Salvos',
          'RRT Team Name': 'Is RRT?',
          Result: 2,
          Sex: 'Other',
          Surname: 'Junior',
          Symptomatic: 'No',
          'Test ID': 'TO_Individual_4',
          'Test Type': 'Covid',
          'Testing Site': 'Space',
          'Vaccination Status': 'Partially vaccinated',
          'Village Code': 'TO_Village_3',
          'Ward Type': 'Not bad',
          eventDate: '2020-05-19',
          orgUnit: 'TO_Individual_4',
        },
      ],
    };

    const numberOfFacilitiesInTonga = await tongaCovidRawData(reqContext);

    expect(numberOfFacilitiesInTonga).toEqual(expectedValue);
  });
});
