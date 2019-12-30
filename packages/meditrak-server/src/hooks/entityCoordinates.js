import { parseCoordinates } from './utilities';

export async function entityCoordinates({ answer, surveyResponse, models }) {
  const entity = await surveyResponse.entity();
  if (!entity) {
    throw new Error(`Could not find entity for survey response ${surveyResponse.id}.`);
  }

  const coordinates = parseCoordinates(answer.text);
  await models.entity.updatePointCoordinates(entity.code, coordinates);
}
