export const getQuestionUsedBy = async (api, recordId) => {
  let usedBy = [];

  const surveyScreenComponentsResponse = await api.get(
    `surveyScreenComponents?filter=${encodeURIComponent(
      JSON.stringify({ question_id: recordId }),
    )}&columns=${encodeURIComponent(JSON.stringify(['id', 'survey_screen.survey_id']))}`,
  );

  const surveysResponse = await api.get(
    `surveys?filter=${encodeURIComponent(
      JSON.stringify({
        id: surveyScreenComponentsResponse.body.map(ssc => ssc['survey_screen.survey_id']),
      }),
    )}`,
  );

  usedBy = [
    ...usedBy,
    ...surveysResponse.body.map(survey => ({
      type: 'survey',
      name: survey.name,
      url: `/surveys?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: survey.code }]),
      )}`,
    })),
  ];

  return usedBy;
};
