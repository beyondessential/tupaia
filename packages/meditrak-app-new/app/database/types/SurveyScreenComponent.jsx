/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class SurveyScreenComponent extends RealmObject {
  getQuestionForReduxStore() {
    return {
      ...this.question.getReduxStoreData(),
      config: this.config ? JSON.parse(this.config) : {},
    };
  }

  getReduxStoreData() {
    const {
      question,
      visibilityCriteria,
      validationCriteria: validationCriteriaString,
      questionLabel,
      detailLabel,
    } = this;
    const validationCriteria = validationCriteriaString ? JSON.parse(validationCriteriaString) : {};
    if (!question) {
      throw new Error(`SurveyScreenComponent with ID ${this.id} has a null question`);
    }
    if (question.type === 'Number') {
      validationCriteria.isNumber = true;
    }
    return {
      questionId: question.id,
      visibilityCriteria: visibilityCriteria ? JSON.parse(visibilityCriteria) : {},
      validationCriteria,
      questionLabel,
      detailLabel,
    };
  }
}

SurveyScreenComponent.schema = {
  name: 'SurveyScreenComponent',
  primaryKey: 'id',
  properties: {
    id: 'string',
    question: 'Question',
    visibilityCriteria: { type: 'string', default: '' }, // JSON string representing answers required for this to be visible
    validationCriteria: { type: 'string', default: '' }, // JSON string representing validation requirements on this field
    componentNumber: { type: 'int', default: 0 },
    questionLabel: { type: 'string', optional: true },
    detailLabel: { type: 'string', optional: true },
    config: { type: 'string', default: '{}' }, // JSON string
  },
};

SurveyScreenComponent.requiredData = ['questionId', 'screenId'];

SurveyScreenComponent.construct = (database, data) => {
  const { questionId, screenId, ...restOfData } = data;
  const question = database.getOrCreate('Question', questionId);
  const surveyScreen = database.getOrCreate('SurveyScreen', screenId);
  const surveyScreenComponent = database.update('SurveyScreenComponent', {
    question,
    ...restOfData,
  });
  surveyScreen.addComponentIfUnique(surveyScreenComponent);
  return surveyScreenComponent;
};
