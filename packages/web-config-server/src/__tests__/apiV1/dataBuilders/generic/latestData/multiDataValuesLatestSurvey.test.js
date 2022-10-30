/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { multiDataValuesLatestSurvey } from '/apiV1/dataBuilders/generic/latestData/multiDataValuesLatestSurvey';

const query = {};
const getDataValues = [
  { code: 'DP78', name: 'Photos of damage 4', id: 'YGxBoAYFWwt' },
  { code: 'DP79', name: 'Photos of damage 5', id: 'on9TvQWoB4X' },
  { code: 'DP80', name: 'Photos of damage 6', id: 'gH8Ka9ty1f2' },
  { code: 'DP81', name: 'Photos of damage 7', id: 'LhvawFkULoI' },
  { code: 'DP83', name: 'Photos of damage 9', id: 'mhcVuKA3vgD' },
  { code: 'DP84', name: 'Photos of damage 10', id: 'qAacIK01uk0' },
];

const surveyDatesResponseDataValues = [
  {
    dataElement: 'tEs7okyAUwe',
    period: '20170629',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '2017-06-29',
    storedBy: 'TupaiaApp',
    created: '2018-01-19T07:19:33.000+0000',
    lastUpdated: '2018-01-19T07:19:33.000+0000',
    followUp: false,
  },
  {
    dataElement: 'tEs7okyAUwe',
    period: '20181214',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '2018-12-14',
    storedBy: 'TupaiaApp',
    created: '2018-12-13T23:22:09.000+0000',
    lastUpdated: '2018-12-13T23:22:09.000+0000',
    followUp: false,
  },
];
const dataValuesForDPRPhotos = [
  {
    dataElement: 'on9TvQWoB4X',
    period: '20181214',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303943_599842.png',
    storedBy: 'TupaiaApp',
    created: '2018-12-13T23:23:32.000+0000',
    lastUpdated: '2018-12-13T23:23:32.000+0000',
    followUp: false,
  },
  {
    dataElement: 'gH8Ka9ty1f2',
    period: '20181214',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303944_108594.png',
    storedBy: 'TupaiaApp',
    created: '2018-12-13T23:23:28.000+0000',
    lastUpdated: '2018-12-13T23:23:28.000+0000',
    followUp: false,
  },
  {
    dataElement: 'LhvawFkULoI',
    period: '20181214',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303946_170161.png',
    storedBy: 'TupaiaApp',
    created: '2018-12-13T23:23:04.000+0000',
    lastUpdated: '2018-12-13T23:23:04.000+0000',
    followUp: false,
  },
  {
    dataElement: 'mhcVuKA3vgD',
    period: '20181214',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303949_825366.png',
    storedBy: 'TupaiaApp',
    created: '2018-12-12T23:23:58.000+0000',
    lastUpdated: '2018-12-13T23:23:58.000+0000',
    followUp: false,
  },
  {
    dataElement: 'qAacIK01uk0',
    period: '20181214',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303952_984280.png',
    storedBy: 'TupaiaApp',
    created: '2018-12-13T23:23:19.000+0000',
    lastUpdated: '2018-12-13T23:23:19.000+0000',
    followUp: false,
  },
];

const dataBuilderConfig = {
  dataElementGroupCode: 'DPR_Photos',
  surveyDataElementCode: 'DPSurveyDate',
};

const expectedOutput = {
  data: [
    {
      name: 'Photos of damage 4',
      dataElement: 'YGxBoAYFWwt',
      value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303941_159700.png',
    },
    {
      name: 'Photos of damage 5',
      dataElement: 'on9TvQWoB4X',
      value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303943_599842.png',
    },
    {
      name: 'Photos of damage 6',
      dataElement: 'gH8Ka9ty1f2',
      value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303944_108594.png',
    },
    {
      name: 'Photos of damage 7',
      dataElement: 'LhvawFkULoI',
      value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303946_170161.png',
    },
    {
      name: 'Photos of damage 10',
      dataElement: 'qAacIK01uk0',
      value: 'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303952_984280.png',
    },
  ],
};

const aggregatorMockup = {};
const dhisApiMockup = {
  getDataValuesInSets: ({ dataElementGroupCode }) => {
    if (dataElementGroupCode === 'DPSurveyDate')
      return Promise.resolve(surveyDatesResponseDataValues);
    if (dataElementGroupCode === 'DPR_Photos') return Promise.resolve(dataValuesForDPRPhotos);
    return Promise.resolve([]);
  },
  getRecord: ({ id }) => getDataValues.find(x => x.id === id),
};

describe('multiDataValuesLatestSurvey', () => {
  it('should have the correct title', async () => {
    const result = await multiDataValuesLatestSurvey(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    expect(result.data.find(({ dataElement }) => dataElement === 'gH8Ka9ty1f2').name).toBe(
      'Photos of damage 6',
    );
  });

  it('should have the correct image', async () => {
    const result = await multiDataValuesLatestSurvey(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    expect(result.data.find(({ dataElement }) => dataElement === 'gH8Ka9ty1f2').value).toBe(
      'https://tupaia.s3.amazonaws.com/dev_uploads/images/1544743303944_108594.png',
    );
  });

  it('should have the right number of images', async () => {
    const result = await multiDataValuesLatestSurvey(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    expect(result.data.length).toBe(5);
  });

  it('should handle missing image', async () => {
    const result = await multiDataValuesLatestSurvey(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    expect(result.data.find(({ dataElement }) => dataElement === 'YGxBoAYFWwt')).toBe(undefined);
  });

  it('should handle missing survey item', async () => {
    const result = await multiDataValuesLatestSurvey(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    expect(result.data.find(({ dataElement }) => dataElement === 'iv1g1ZlX4oj')).toBe(undefined);
  });
});
