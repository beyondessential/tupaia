import { getHookAnswerValues, parseCoordinates } from './utilities';

/* eslint-disable camelcase */

async function getEntityInfoFromSurveyResponse(surveyResponse) {
  const answerValues = await getHookAnswerValues(surveyResponse, 'entityCreate', 'code');

  // set some sane defaults
  return {
    name: answerValues.code,
    type: 'facility',
    image_url: null,
    location: null,
    ...answerValues,
  };
}

async function createNewEntity(answerValues, parent, models) {
  const { id, code, name, type, image_url, location } = answerValues;

  // create the entity
  const entity = await models.entity.create({
    id,
    code,
    name,
    type,
    image_url,
    parent_id: parent.id,
    country_code: parent.country_code,
  });

  // update location/bounds in a separate pass
  if (location) {
    try {
      const coordinates = parseCoordinates(location);
      await models.entity.updatePointCoordinates(code, coordinates);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  return entity;
}

export async function entityCreate({ surveyResponse, models }) {
  const answerValues = await getEntityInfoFromSurveyResponse(surveyResponse);
  const parentEntity = await surveyResponse.entity();

  // check if we're creating or updating
  const { code } = answerValues;
  const existingEntity = await models.entity.findOne({ code });

  if (existingEntity) {
    // individual hooks will trigger entityUpdate
    return;
  }

  await createNewEntity(answerValues, parentEntity, models);
}

// 2nd order function that looks for an existing entity and, if found, runs func
function entityUpdater(func) {
  return async ({ answer, surveyResponse, models }) => {
    const answerValues = await getEntityInfoFromSurveyResponse(surveyResponse);
    const { code } = answerValues;
    const existingEntity = await models.entity.findOne({ code });

    // no entity exists - it will be created when the `code` survey answer
    // is processed (and this answer will be processed along with it)
    if (!existingEntity) return;

    await func(existingEntity, answer, models);
  };
}

// Some of these have similar logic as (for eg) entityImage
// or entityCoordinates. The differences with these ones:
//  - they fail silently
//  - they work off the entity indicated by the "code" answer
//    rather than the entity the survey was submitted against

/* eslint-disable no-param-reassign */

export const entityCreate_name = entityUpdater((entity, answer) => {
  entity.name = answer.text;
  return entity.save();
});

export const entityCreate_type = entityUpdater((entity, answer) => {
  entity.type = answer.text;
  return entity.save();
});

export const entityCreate_image_url = entityUpdater((entity, answer) => {
  entity.image_url = answer.text;
  return entity.save();
});

export const entityCreate_location = entityUpdater(async (entity, answer, models) => {
  const coordinates = parseCoordinates(answer.text);
  await models.entity.updatePointCoordinates(entity.code, coordinates);
});
