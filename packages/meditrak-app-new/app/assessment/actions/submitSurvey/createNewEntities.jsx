/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { getEntityCreationQuestions } from '../../helpers';
import { getAnswers } from '../../selectors';
import { changeAnswer } from '../actions';

const buildEntity = async (state, database, fields, entityId, answers) => {
  const entity = { id: entityId };
  Object.entries(fields).forEach(([fieldName, value]) => {
    // Value is not defined, skip
    if (value === undefined) {
      return;
    }

    const fieldValue = typeof value === 'string' ? value : answers[value.questionId];
    if (fieldName === 'parentId') {
      entity.parent = database.findOne('Entity', fieldValue, 'id');
    } else {
      entity[fieldName] = fieldValue;
    }
  });

  const getSelectedCountry = () => database.getCountry(state.country.selectedCountryId);
  if (!entity.countryCode) {
    entity.countryCode = getSelectedCountry().code;
  }
  if (!entity.parent) {
    const country = getSelectedCountry();
    entity.parent = country.entity(database);
  }
  if (!entity.code) {
    entity.code = entityId;
  }

  return entity;
};

export const createNewEntities = async (dispatch, getState, database, questions) => {
  const entityCreationQuestions = getEntityCreationQuestions(questions);
  const answers = getAnswers(getState());
  const newEntities = [];
  await Promise.all(
    entityCreationQuestions.map(async question => {
      const { code, name, parentId, type } = question.config.entity;
      const answer = answers[question.id];
      const fields = { id: answer, code, name, parentId, type: type[0] };

      const entity = await buildEntity(getState(), database, fields, answer, answers);
      newEntities.push(entity);
      dispatch(changeAnswer(question.id, entity.id));
    }),
  );

  return newEntities;
};
