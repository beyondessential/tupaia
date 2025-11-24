import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { generateId } from '@tupaia/database';
import { DhisChangeDetailGenerator } from '../../dhis/DhisChangeDetailGenerator';

import {
  MODELS,
  REGIONAL_SURVEY_RESPONSE,
  TONGA_SURVEY_RESPONSE,
} from './DhisChangeDetailGenerator.fixtures';

const buildChange = (type, { id, ...record }) => {
  const recordId = id || generateId();
  return {
    record_type: type,
    record_id: recordId,
    new_record: {
      id: recordId,
      ...record,
    },
    old_record: null,
  };
};

const generator = new DhisChangeDetailGenerator(MODELS);

const assertCorrectDetailsGenerated = async testData => {
  const changes = testData.map(d => d.change);
  const expectedDetails = testData.map(d => JSON.stringify(d.expectedDetails));
  const details = await generator.generateDetails(changes);
  expect(details).to.deep.equal(expectedDetails);
};

describe('DhisChangeDetailGenerator', () => {
  it('generates change details for entities', async () => {
    const buildTestData = ({ metadata, expectedIsDataRegional }) => ({
      change: buildChange('entity', { metadata, country_code: 'DL' }),
      expectedDetails: {
        isDataRegional: expectedIsDataRegional,
        organisationUnitCode: 'DL',
      },
    });
    const testData = [
      {
        metadata: { dhis: { isDataRegional: true } },
        expectedIsDataRegional: true,
      },
      {
        metadata: { dhis: { isDataRegional: false } },
        expectedIsDataRegional: false,
      },
      {
        metadata: { dhis: {} },
        expectedIsDataRegional: true, // if not defined, default to true
      },
      {
        metadata: {},
        expectedIsDataRegional: true, // if not defined, default to true
      },
    ].map(buildTestData);
    await assertCorrectDetailsGenerated(testData);
  });

  it('generates change details for survey responses', async () => {
    const testData = [
      {
        change: buildChange('survey_response', REGIONAL_SURVEY_RESPONSE),
        expectedDetails: {
          isDataRegional: true,
          organisationUnitCode: 'DL',
        },
      },
      {
        change: buildChange('survey_response', TONGA_SURVEY_RESPONSE),
        expectedDetails: {
          isDataRegional: false,
          organisationUnitCode: 'TO_Tongatapu_Tofoa',
        },
      },
    ];
    await assertCorrectDetailsGenerated(testData);
  });

  it('generates change details for answers', async () => {
    const testData = [
      {
        change: buildChange('answer', { survey_response_id: REGIONAL_SURVEY_RESPONSE.id }),
        expectedDetails: {
          isDataRegional: true,
          organisationUnitCode: 'DL',
        },
      },
      {
        change: buildChange('answer', { survey_response_id: TONGA_SURVEY_RESPONSE.id }),
        expectedDetails: {
          isDataRegional: false,
          organisationUnitCode: 'TO_Tongatapu_Tofoa',
        },
      },
    ];
    await assertCorrectDetailsGenerated(testData);
  });
});
