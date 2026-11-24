/**
 * { user_email: "user@beyondessential.com.au" } => { user_id: "5fbb27d061f76a22920130a1", assessor_name: "User One" }
 */
export const translateUserEmailToIdAndAssessorName = async (userModel, email) => {
  const user = await userModel.findOne({ email });
  return { user_id: user.id, assessor_name: user.fullName };
};

/**
 * { entity_code: "TO" } => { entity_id: "5d3f884471bb2e31bfacae23" }
 */
export const translateEntityCodeToId = async (entityModel, code) => {
  const entity = await entityModel.findOne({ code });
  return { entity_id: entity.id };
};

/**
 * { survey_code: "PSSS_Confirmed_WNR" } => { entity_id: "5fb5ff5b61f76a7cdf06233f" }
 */
export const translateSurveyCodeToId = async (surveyModel, code) => {
  const survey = await surveyModel.findOne({ code });
  return { survey_id: survey.id };
};

/**
 * { question_code: "RHS1UNFPA68" } => { question_id: "5e01604261f76a4835c6600c" }
 *
 * Not to be confused with `translateQuestionCodeToId`, which translates question codes within a
 * survey question’s config to `{ questionId }`.
 */
export const translateAnswerQuestionCodeToId = async (questionModel, code) => {
  const question = await questionModel.findOneOrThrow(
    { code },
    { columns: ['id'] },
    `No question found with code ${code}`,
  );
  return { question_id: question.id };
};
