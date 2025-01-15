import { getUpsertEntityQuestions } from '../../helpers';
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

  const isUpdate = database.findOne('Entity', entityId);
  if (isUpdate) {
    return entity;
  }

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

export const createUpsertEntityObjects = async (dispatch, getState, database, questions) => {
  const entityUpsertQuestions = getUpsertEntityQuestions(questions);

  const answers = getAnswers(getState());
  const newEntities = [];
  await Promise.all(
    entityUpsertQuestions.map(async question => {
      const { code, name, parentId, type } = question.config.entity.fields;
      const entityId = answers[question.id];
      const fields = { code, name, parentId, type };
      const entity = await buildEntity(getState(), database, fields, entityId, answers);
      newEntities.push(entity);
      dispatch(changeAnswer(question.id, entity.id));
    }),
  );

  return newEntities;
};
