import { composePercentagesPerPeriod } from '/apiV1/dataBuilders';
import * as ComposeDataPerPeriod from '/apiV1/dataBuilders/generic/compose/composeDataPerPeriod';

const stubComposeDataPerPeriod = expectedData =>
  jest.spyOn(ComposeDataPerPeriod, 'composeDataPerPeriod').mockResolvedValue(expectedData);

describe('composePercentagesPerPeriod', () => {
  it('should call composeDataPerPeriod() with the correct arguments', async () => {
    const composeDataPerPeriodStub = stubComposeDataPerPeriod({ data: [] });
    const config = { dataBuilderConfig: { percentages: {} } };
    const aggregatorStub = {};
    const dhisApiStub = {};

    await composePercentagesPerPeriod(config, aggregatorStub, dhisApiStub);
    expect(composeDataPerPeriodStub).toHaveBeenCalledOnceWith(config, aggregatorStub, dhisApiStub);
  });

  it('should compose period data for a single percentage definition', async () => {
    const config = {
      dataBuilderConfig: {
        percentages: {
          result: { numerator: 'positive', denominator: 'total' },
        },
      },
    };
    const data = [
      { timestamp: 1569888000000, name: 'Oct 2019', positive: 1, total: 2 },
      { timestamp: 1572566400000, name: 'Nov 2019', positive: 3, total: 4 },
    ];
    stubComposeDataPerPeriod({ data });

    const response = await composePercentagesPerPeriod(config);
    expect(response).toStrictEqual({
      data: [
        {
          timestamp: 1569888000000,
          name: 'Oct 2019',
          result: 0.5,
          result_metadata: { numerator: 1, denominator: 2 },
        },
        {
          timestamp: 1572566400000,
          name: 'Nov 2019',
          result: 0.75,
          result_metadata: { numerator: 3, denominator: 4 },
        },
      ],
    });
  });

  it('should compose period data for multiple percentage definitions', async () => {
    const config = {
      dataBuilderConfig: {
        percentages: {
          positivePercentage: { numerator: 'positive', denominator: 'total' },
          femalePercentage: { numerator: 'female', denominator: 'population' },
        },
      },
    };
    const data = [
      {
        timestamp: 1569888000000,
        name: 'Oct 2019',
        positive: 1,
        total: 2,
        female: 150,
        population: 600,
      },
      {
        timestamp: 1572566400000,
        name: 'Nov 2019',
        positive: 3,
        total: 4,
        female: 300,
        population: 600,
      },
    ];
    stubComposeDataPerPeriod({ data });

    const response = await composePercentagesPerPeriod(config);
    expect(response).toStrictEqual({
      data: [
        {
          timestamp: 1569888000000,
          name: 'Oct 2019',
          positivePercentage: 0.5,
          positivePercentage_metadata: { numerator: 1, denominator: 2 },
          femalePercentage: 0.25,
          femalePercentage_metadata: { numerator: 150, denominator: 600 },
        },
        {
          timestamp: 1572566400000,
          name: 'Nov 2019',
          positivePercentage: 0.75,
          positivePercentage_metadata: { numerator: 3, denominator: 4 },
          femalePercentage: 0.5,
          femalePercentage_metadata: { numerator: 300, denominator: 600 },
        },
      ],
    });
  });

  it('should exclude non numeric percentages from the results', async () => {
    const config = {
      dataBuilderConfig: {
        percentages: {
          result: { numerator: 'positive', denominator: 'total' },
        },
      },
    };
    const data = [
      { timestamp: 1569888000000, name: 'Oct 2019', total: 2 },
      { timestamp: 1572566400000, name: 'Nov 2019', positive: 3, total: 4 },
    ];
    stubComposeDataPerPeriod({ data });

    const response = await composePercentagesPerPeriod(config);
    expect(response).toStrictEqual({
      data: [
        {
          timestamp: 1572566400000,
          name: 'Nov 2019',
          result: 0.75,
          result_metadata: { numerator: 3, denominator: 4 },
        },
      ],
    });
  });
});
