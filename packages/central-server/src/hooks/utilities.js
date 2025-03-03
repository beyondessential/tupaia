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

  // flatten the array of { key: val }s into { keyA: val, keyB: val }
  return valueArray.reduce(
    (all, value) => ({
      ...all,
      ...value,
    }),
    {},
  );
}

export function parseCoordinates(answerText) {
  const { latitude, longitude } = JSON.parse(answerText);
  if (Number.isNaN(Number.parseFloat(latitude)) || Number.isNaN(Number.parseFloat(longitude))) {
    throw new Error(`Invalid coordinate data: ${answer.text}`);
  }

  return { latitude, longitude };
}
