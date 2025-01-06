/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { getEntityQuestionAncestorAnswers } from '../../../features/Survey/utils/usePrimaryEntityQuestionAutoFill';

describe('getEntityQuestionAncestorAnswers', () => {
  it('should return an empty object if the answer is not found', () => {
    const question = {
      config: {
        entity: {
          filter: {
            type: ['facility'],
          },
        },
      },
    };
    const questionsById = {};
    const ancestorsByType = {};
    // @ts-ignore
    expect(getEntityQuestionAncestorAnswers(question, questionsById, ancestorsByType)).toEqual({});
  });

  it('should return the answer id if there is no parent question', () => {
    const question = {
      id: 'questionId',
      config: {
        entity: {
          filter: {
            type: ['facility'],
          },
        },
      },
    };
    const questionsById = {};
    const ancestorsByType = {
      facility: {
        id: 'facilityId',
      },
    };
    // @ts-ignore
    expect(getEntityQuestionAncestorAnswers(question, questionsById, ancestorsByType)).toEqual({
      questionId: 'facilityId',
    });
  });

  it('should return the ancestor id and the parent question ancestor ids', () => {
    const question = {
      id: 'questionId',
      config: {
        entity: {
          filter: {
            parentId: { questionId: 'parentQuestionId' },
            type: ['facility'],
          },
        },
      },
    };
    const parentQuestion = {
      id: 'parentQuestionId',
      config: {
        entity: {
          filter: {
            type: ['district'],
          },
        },
      },
    };
    const questionsById = {
      questionId: question,
      parentQuestionId: parentQuestion,
    };
    const ancestorsByType = {
      facility: {
        id: 'facilityId',
      },
      district: {
        id: 'districtId',
      },
    };

    expect(
      // @ts-ignore
      getEntityQuestionAncestorAnswers(question, questionsById, ancestorsByType),
    ).toEqual({
      questionId: 'facilityId',
      parentQuestionId: 'districtId',
    });
  });
});
