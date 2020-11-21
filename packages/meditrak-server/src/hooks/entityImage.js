export async function entityImage({ answer, surveyResponse, models }) {
  const entity = await surveyResponse.entity();

  if (!entity) {
    throw new Error('Invalid entity');
  }

  const imageUrl = answer.text;

  entity.image_url = imageUrl;
  await entity.save();
}
