const snakeCased = name =>
  name
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();

export async function entityAttribute({ answer, surveyResponse, hookName }) {
  const entity = await surveyResponse.entity();

  if (!entity) {
    throw new Error('Invalid entity');
  }

  const attributeKey = snakeCased(hookName.substring(15));
  const attributeValue = answer.text;

  entity.attributes = { ...entity.attributes, [attributeKey]: attributeValue };

  await entity.save();
}
