/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';
import { doesIdExist } from './utilities';

export class SurveyScreen extends RealmObject {
  addComponentIfUnique(component) {
    if (doesIdExist(this.components, component.id)) return;
    this.components.push(component);
  }

  getQuestionsForReduxStore() {
    return this.components.map(component => component.getQuestionForReduxStore());
  }

  getReduxStoreData() {
    const { screenNumber } = this;
    const components = this.components.sorted('componentNumber');
    return {
      screenNumber,
      components: components.map(component => component.getReduxStoreData()),
    };
  }
}

SurveyScreen.schema = {
  name: 'SurveyScreen',
  primaryKey: 'id',
  properties: {
    id: 'string',
    components: { type: 'list', objectType: 'SurveyScreenComponent' },
    screenNumber: { type: 'int', default: 0 },
  },
};

SurveyScreen.requiredData = ['surveyId', 'screenNumber'];

SurveyScreen.construct = (database, data) => {
  const { surveyId, ...restOfData } = data;
  const survey = database.getOrCreate('Survey', surveyId);
  const screen = database.update('SurveyScreen', restOfData);
  survey.addScreenIfUnique(screen);
  return screen;
};
