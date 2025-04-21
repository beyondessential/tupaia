export async function getHookAnswerValues(surveyResponse, baseHookName, defaultField) {
  const answers = await surveyResponse.getAnswers();

  // get all the questions from the db and pair them up with
  // the value indicated by question.hook
  const valueArray = await Promise.all(
    answers.map(async answer => {
      const question = await answer.question();
      if (!question.hook) return null;

      const [hook, ...extra] = question.hook.split('_');
      if (hook !== baseHookName) return null;

      const field = extra.join('_') || defaultField;
      return { [field]: answer.text };
    }),
  );

  return valueArray.reduce((all, value) => Object.assign(all, value), {});
}

export function parseCoordinates(answerText) {
  const answer = JSON.parse(answerText);

  const latitude = Number.parseFloat(answer.latitude);
  const longitude = Number.parseFloat(answer.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error(`Invalid coordinate data: ${answerText}`);
  }

  return { latitude, longitude };
}
