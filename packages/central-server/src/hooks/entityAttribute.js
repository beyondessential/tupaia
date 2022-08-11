import { snake } from 'case';
import { ENTITY_ATTRIBUTE_HOOK_PREFIX } from './constants';

export async function entityAttribute({ answer, surveyResponse, hookName }) {
  const entity = await surveyResponse.entity();

  if (!entity) {
    throw new Error('Invalid entity');
  }

  const attributeKey = snake(hookName.substring(ENTITY_ATTRIBUTE_HOOK_PREFIX.length));
  const attributeValue = answer.text;

  entity.attributes = { ...entity.attributes, [attributeKey]: attributeValue };

  await entity.save();
}
