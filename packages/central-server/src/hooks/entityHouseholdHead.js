import { updateJsonFieldValue } from './utilities';

export async function entityHouseholdHead({ answer, surveyResponse }) {
  const entity = await surveyResponse.entity();

  if (!entity) {
    throw new Error('Invalid entity');
  }

  const householdHead = answer.text;

  const updatedAttributes = updateJsonFieldValue(entity.attributes, {
    household_head: householdHead,
  });

  entity.attributes = updatedAttributes;

  await entity.save();
}
