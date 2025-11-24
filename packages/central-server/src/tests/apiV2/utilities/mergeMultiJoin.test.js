import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import { mergeMultiJoin } from '../../../apiV2/utilities/mergeMultiJoin';

describe('mergeMultiJoin', () => {
  it('returns the base multiJoin when no second multiJoin is provided', () => {
    const baseMultiJoin = [
      {
        joinWith: 'question',
        joinCondition: ['question.id', 'survey_screen_component.question_id'],
      },
      {
        joinWith: 'survey_screen',
        joinCondition: ['survey_screen.id', 'survey_screen_component.screen_id'],
      },
    ];
    expect(mergeMultiJoin(baseMultiJoin)).to.equal(baseMultiJoin);
  });

  it('returns all members of both multiJoins when no there is no overlap', () => {
    const baseMultiJoin = [
      {
        joinWith: 'question',
        joinCondition: ['question.id', 'survey_screen_component.question_id'],
      },
      {
        joinWith: 'survey_screen',
        joinCondition: ['survey_screen.id', 'survey_screen_component.screen_id'],
      },
    ];
    const multiJoinToMerge = [
      {
        joinWith: 'survey',
        joinCondition: ['survey.id', 'survey_screen.survey_id'],
      },
      {
        joinWith: 'survey_response',
        joinCondition: ['survey_response.survey_id', 'survey.id'],
      },
    ];
    const mergedMultiJoin = [
      {
        joinWith: 'question',
        joinCondition: ['question.id', 'survey_screen_component.question_id'],
      },
      {
        joinWith: 'survey_screen',
        joinCondition: ['survey_screen.id', 'survey_screen_component.screen_id'],
      },
      {
        joinWith: 'survey',
        joinCondition: ['survey.id', 'survey_screen.survey_id'],
      },
      {
        joinWith: 'survey_response',
        joinCondition: ['survey_response.survey_id', 'survey.id'],
      },
    ];
    expect(mergeMultiJoin(baseMultiJoin, multiJoinToMerge)).to.deep.equal(mergedMultiJoin);
  });

  it('returns only unique members, preferring baseMultiJoin, when there is overlap', () => {
    const baseMultiJoin = [
      {
        joinWith: 'question',
        joinCondition: ['question.id', 'survey_screen_component.question_id'],
      },
      {
        joinWith: 'survey_screen',
        joinCondition: ['survey_screen.id', 'survey_screen_component.screen_id'],
      },
    ];
    const multiJoinToMerge = [
      {
        joinWith: 'survey_screen',
        joinCondition: ['survey_screen.id', 'survey_screen_component.another_screen_id'],
      },
      {
        joinWith: 'survey',
        joinCondition: ['survey.id', 'survey_screen.survey_id'],
      },
    ];
    const mergedMultiJoin = [
      {
        joinWith: 'question',
        joinCondition: ['question.id', 'survey_screen_component.question_id'],
      },
      {
        joinWith: 'survey_screen',
        joinCondition: ['survey_screen.id', 'survey_screen_component.screen_id'],
      },
      {
        joinWith: 'survey',
        joinCondition: ['survey.id', 'survey_screen.survey_id'],
      },
    ];
    expect(mergeMultiJoin(baseMultiJoin, multiJoinToMerge)).to.deep.equal(mergedMultiJoin);
  });
});
